"""
LLM Provider Abstraction (item 1 — Real LLM integration, provider fallback,
graceful failure handling). These tests mock at the `_build_chat_model`
boundary rather than hitting a real OpenAI/Anthropic endpoint (unavailable
in CI/this sandbox), so what's actually under test is *this module's*
fallback/error-handling logic — the exact thing item 1 asks to verify —
not a third party's API.
"""
from unittest.mock import AsyncMock, MagicMock

import pytest
from langchain_core.runnables import RunnableLambda
from pydantic import BaseModel

from app.core.config import settings
from app.services import llm_provider


class _DummySchema(BaseModel):
    answer: str


def _fake_chain_result(monkeypatch, result_text: str = "a real answer"):
    """Builds a fake LangChain chat model whose `prompt | model.with_structured_output(...)`
    pipeline resolves to a real result. Uses RunnableLambda (a real
    LangChain Runnable) rather than a hand-rolled __or__ stub, since
    LangChain's `|` operator requires an actual Runnable on the right-hand
    side — a plain object with __or__ defined isn't enough."""

    async def _resolve(_prompt_value):
        return _DummySchema(answer=result_text)

    structured = RunnableLambda(_resolve)

    class _FakeModel:
        def with_structured_output(self, schema):
            return structured

    return _FakeModel()


async def test_primary_provider_success_never_touches_fallback(monkeypatch):
    calls = []

    def fake_build(provider, temperature):
        calls.append(provider)
        if provider == "openai":
            return _fake_chain_result(monkeypatch)
        raise AssertionError("fallback provider should not be built when primary succeeds")

    monkeypatch.setattr(llm_provider, "_build_chat_model", fake_build)
    result = await llm_provider.get_structured_result(
        system_prompt="sys", human_prompt="hum", variables={}, output_schema=_DummySchema
    )
    assert result.answer == "a real answer"
    assert calls == ["openai"]


async def test_primary_failure_falls_back_to_secondary_provider(monkeypatch):
    """The core 'provider fallback' requirement: if OpenAI raises for any
    reason (quota, auth, network), Anthropic is tried automatically — the
    caller gets a real result, not an error."""
    attempted = []

    class _FailingModel:
        def with_structured_output(self, schema):
            async def _fail(_prompt_value):
                raise RuntimeError("simulated 429 rate limit from provider")
            return RunnableLambda(_fail)

    def fake_build(provider, temperature):
        attempted.append(provider)
        if provider == "openai":
            return _FailingModel()
        if provider == "anthropic":
            return _fake_chain_result(monkeypatch, result_text="fallback worked")
        return None

    monkeypatch.setattr(llm_provider, "_build_chat_model", fake_build)
    result = await llm_provider.get_structured_result(
        system_prompt="sys", human_prompt="hum", variables={}, output_schema=_DummySchema
    )
    assert result.answer == "fallback worked"
    assert attempted == ["openai", "anthropic"]


async def test_all_providers_failing_raises_all_providers_unavailable(monkeypatch):
    class _FailingModel:
        def with_structured_output(self, schema):
            async def _fail(_prompt_value):
                raise TimeoutError("simulated timeout")
            return RunnableLambda(_fail)

    monkeypatch.setattr(llm_provider, "_build_chat_model", lambda provider, temperature: _FailingModel())

    with pytest.raises(llm_provider.AllProvidersUnavailableError):
        await llm_provider.get_structured_result(
            system_prompt="sys", human_prompt="hum", variables={}, output_schema=_DummySchema
        )


async def test_no_providers_configured_raises_gracefully_not_crash(monkeypatch):
    """Missing API keys (_build_chat_model returns None) must be handled as
    gracefully as a provider that actively fails — never an unhandled
    exception or a crash."""
    monkeypatch.setattr(llm_provider, "_build_chat_model", lambda provider, temperature: None)

    with pytest.raises(llm_provider.AllProvidersUnavailableError):
        await llm_provider.get_structured_result(
            system_prompt="sys", human_prompt="hum", variables={}, output_schema=_DummySchema
        )


async def test_streaming_falls_back_to_secondary_provider_mid_call(monkeypatch):
    """A provider failing before yielding any chunk (e.g. auth rejected
    immediately) must not abort the whole stream — the next provider in the
    chain should be tried."""

    class _FailingStreamModel:
        def with_structured_output(self, schema):  # pragma: no cover - not used here
            raise NotImplementedError

    async def _failing_gen(_prompt_value):
        raise ConnectionError("simulated network failure")
        yield  # pragma: no cover - unreachable, makes this an async generator

    async def _working_gen(_prompt_value):
        for piece in ["Hello", " world"]:
            chunk = MagicMock()
            chunk.content = piece
            yield chunk

    def fake_build(provider, temperature):
        if provider == "openai":
            return RunnableLambda(func=lambda x: None, afunc=_failing_gen)
        if provider == "anthropic":
            return RunnableLambda(func=lambda x: None, afunc=_working_gen)
        return None

    monkeypatch.setattr(llm_provider, "_build_chat_model", fake_build)

    chunks = []
    async for piece in llm_provider.stream_text_result_with_history(messages=[("system", "sys")], variables={}):
        chunks.append(piece)
    assert "".join(chunks) == "Hello world"


async def test_streaming_raises_when_all_providers_produce_no_content(monkeypatch):
    class _EmptyStreamModel:
        def __or__(self, other):
            return self

        def astream(self, variables):
            async def _gen():
                return
                yield  # pragma: no cover
            return _gen()

    monkeypatch.setattr(llm_provider, "_build_chat_model", lambda provider, temperature: _EmptyStreamModel())

    with pytest.raises(llm_provider.AllProvidersUnavailableError):
        chunks = []
        async for piece in llm_provider.stream_text_result_with_history(messages=[("system", "sys")], variables={}):
            chunks.append(piece)


async def test_provider_chain_respects_configured_order_and_dedup(monkeypatch):
    monkeypatch.setattr(settings, "LLM_PROVIDER", "anthropic")
    monkeypatch.setattr(settings, "LLM_FALLBACK_PROVIDER", "anthropic")  # same as primary
    chain = llm_provider._provider_chain()
    assert chain == ["anthropic"]  # de-duplicated, not tried twice


async def test_fallback_disabled_when_empty_string(monkeypatch):
    monkeypatch.setattr(settings, "LLM_PROVIDER", "openai")
    monkeypatch.setattr(settings, "LLM_FALLBACK_PROVIDER", "")
    chain = llm_provider._provider_chain()
    assert chain == ["openai"]


# --------------------------------------------------------------------------
# Regression tests: Settings.OPENAI_TIMEOUT / Settings.ANTHROPIC_TIMEOUT must
# exist with safe defaults, and _build_chat_model must never raise
# AttributeError (or any other exception) up to the caller — a failed
# initialization for one provider must be swallowed (logged) and treated the
# same as "not configured", so the other provider (or the deterministic
# fallback) still gets a chance.
# --------------------------------------------------------------------------
def test_settings_has_safe_default_timeouts():
    assert hasattr(settings, "OPENAI_TIMEOUT")
    assert hasattr(settings, "ANTHROPIC_TIMEOUT")
    assert isinstance(settings.OPENAI_TIMEOUT, (int, float)) and settings.OPENAI_TIMEOUT > 0
    assert isinstance(settings.ANTHROPIC_TIMEOUT, (int, float)) and settings.ANTHROPIC_TIMEOUT > 0


def test_build_chat_model_openai_uses_configured_timeout_and_key(monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "sk-test-fake-key")
    monkeypatch.setattr(settings, "OPENAI_TIMEOUT", 12.5)

    captured = {}

    class _FakeChatOpenAI:
        def __init__(self, **kwargs):
            captured.update(kwargs)

    import types
    fake_module = types.ModuleType("langchain_openai")
    fake_module.ChatOpenAI = _FakeChatOpenAI
    monkeypatch.setitem(__import__("sys").modules, "langchain_openai", fake_module)

    model = llm_provider._build_chat_model("openai", 0.4)
    assert isinstance(model, _FakeChatOpenAI)
    assert captured["timeout"] == 12.5
    assert captured["api_key"] == "sk-test-fake-key"
    # The real key must never be logged anywhere this test could see it via
    # the returned object's repr in normal use — asserted implicitly by the
    # fact only `captured` (a test-local dict) holds it.


def test_build_chat_model_returns_none_without_api_key():
    # No API key configured -> provider is skipped, not attempted/raised.
    assert llm_provider._build_chat_model("openai", 0.4) is None
    assert llm_provider._build_chat_model("anthropic", 0.4) is None


def test_build_chat_model_swallows_init_errors_and_returns_none(monkeypatch, caplog):
    """If the underlying client constructor raises for any reason (bad
    config, incompatible SDK version, etc.), _build_chat_model must catch
    it, log a clear (secret-free) warning, and return None -- never let the
    exception propagate and 500 the request."""
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "sk-test-fake-key")

    import types

    class _BoomOpenAI:
        def __init__(self, **kwargs):
            raise ValueError("simulated bad client configuration")

    fake_module = types.ModuleType("langchain_openai")
    fake_module.ChatOpenAI = _BoomOpenAI
    monkeypatch.setitem(__import__("sys").modules, "langchain_openai", fake_module)

    with caplog.at_level("WARNING"):
        result = llm_provider._build_chat_model("openai", 0.4)

    assert result is None
    assert any("Failed to initialize OpenAI" in r.message for r in caplog.records)
    # Never leak the API key value into logs.
    assert not any("sk-test-fake-key" in r.message for r in caplog.records)


def test_build_chat_model_anthropic_init_failure_does_not_affect_openai(monkeypatch):
    """One provider failing to initialize must not break the other -- the
    provider chain should still be able to use OpenAI even if Anthropic's
    client construction blows up."""
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "sk-openai-fake")
    monkeypatch.setattr(settings, "ANTHROPIC_API_KEY", "sk-ant-fake")

    import types

    class _WorkingOpenAI:
        def __init__(self, **kwargs):
            pass

    class _BoomAnthropic:
        def __init__(self, **kwargs):
            raise RuntimeError("simulated anthropic client init failure")

    openai_module = types.ModuleType("langchain_openai")
    openai_module.ChatOpenAI = _WorkingOpenAI
    anthropic_module = types.ModuleType("langchain_anthropic")
    anthropic_module.ChatAnthropic = _BoomAnthropic
    monkeypatch.setitem(__import__("sys").modules, "langchain_openai", openai_module)
    monkeypatch.setitem(__import__("sys").modules, "langchain_anthropic", anthropic_module)

    assert llm_provider._build_chat_model("openai", 0.4) is not None
    assert llm_provider._build_chat_model("anthropic", 0.4) is None


# --------------------------------------------------------------------------
# End-to-end-ish verification that when an API key IS configured, the real
# provider path is attempted first (not silently skipped straight to the
# deterministic fallback), and that its output is what's returned -- i.e.
# "fallback behavior" and "real LLM behavior" are clearly distinguishable.
# --------------------------------------------------------------------------
async def test_configured_key_is_tried_before_any_fallback_text(monkeypatch):
    from langchain_core.runnables import RunnableLambda

    monkeypatch.setattr(settings, "LLM_PROVIDER", "openai")
    monkeypatch.setattr(settings, "LLM_FALLBACK_PROVIDER", "anthropic")
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "sk-configured-fake-key")
    monkeypatch.setattr(settings, "ANTHROPIC_API_KEY", "")

    attempted = []

    class _RealLLMStandIn:
        """Stands in for a successfully-initialized ChatOpenAI whose call
        returns genuine model output, distinguishing this path from the
        deterministic fallback string produced when no provider works."""
        def with_structured_output(self, schema):
            async def _resolve(_prompt_value):
                return _DummySchema(answer="REAL_LLM_OUTPUT_NOT_FALLBACK")
            return RunnableLambda(_resolve)

    def fake_build(provider, temperature):
        attempted.append(provider)
        assert settings.OPENAI_API_KEY, "provider must only build when a key is configured"
        return _RealLLMStandIn()

    monkeypatch.setattr(llm_provider, "_build_chat_model", fake_build)

    result = await llm_provider.get_structured_result(
        system_prompt="sys", human_prompt="hum", variables={}, output_schema=_DummySchema
    )
    assert result.answer == "REAL_LLM_OUTPUT_NOT_FALLBACK"
    assert attempted == ["openai"]  # primary tried first; anthropic never needed
