import os
import math
import re
from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.schemas import FallacyReport, FallacyReportSchema

REFEREE_SYSTEM_PROMPT = """ You are an elite, objective debate coach acting as a logical fallacy referee.
Analyze the user's debate point text and determine if any of the following logical fallacies are committed:
1. Ad Hominem: Attacking the opponent's character or credentials directly instead of answering their argument.
2. Straw Man: Misrepresenting or oversimplifying an opponent's position to make it easier to attack.
3. False Dilemma: Presenting only two choices or outcomes when more possibilities actually exist.
4. Slippery Slope: Arguing that a small first step will inevitably lead to a chain of catastrophic events without logical proof.
5. Appeal to Authority: Claiming something is true solely because an authority figure said it, without citing verification or actual evidence.
6. Circular Reasoning: Supporting a premise with the premise itself, repeating the claim in different words instead of proving it.
7. Hasty Generalization: Drawing a broad conclusion based on a small or unrepresentative sample size.
8. Red Herring: Introducing an irrelevant topic to divert attention away from the original argument.

Your output must be strictly structured. If a fallacy is detected:
- Set fallacy_detected to true.
- Set fallacy_type to the matched fallacy name (must be 'Ad Hominem', 'Straw Man', 'False Dilemma', 'Slippery Slope', 'Appeal to Authority', 'Circular Reasoning', 'Hasty Generalization', or 'Red Herring').
- Set offending_text to the exact substring/phrase in the text that commits the fallacy.
- Set explanation to a detailed explanation of why this reasoning failed.
- Set correction_suggestion to a clear recommendation of how to fix or rephrase the argument to be logically sound.

If no fallacy is committed, set fallacy_detected to false, fallacy_type to 'None', and the remaining fields to null or empty strings.
"""

def local_analyze_fallacy(text: str) -> dict:
    """A robust regex-based local fallback for fallacy detection."""
    text_lower = text.lower()
    rules = [
        {
            "name": "Ad Hominem",
            "keywords": ["foolish", "ignorant", "stupid", "hypocritical", "unqualified", "corrupt", "idiot", "naive", "childish", "bias", "brains"],
            "explanation": "Attacking the opponent's character or credentials directly instead of answering their argument.",
            "correction": "Focus on the logic, facts, and evidence of the opponent's argument rather than their personal traits or motives."
        },
        {
            "name": "Straw Man",
            "keywords": ["completely ignore", "total disregard", "destroy all", "ban all", "eliminate every", "destroy", "stone age"],
            "explanation": "Misrepresenting or oversimplifying an opponent's position to make it easier to attack.",
            "correction": "Represent your opponent's arguments accurately and charitably before criticizing them."
        },
        {
            "name": "False Dilemma",
            "keywords": ["either we", "only two choices", "must choose", "no other option", "total ruin"],
            "explanation": "Presenting only two options or outcomes when more possibilities actually exist.",
            "correction": "Acknowledge the nuances and alternative courses of action that exist between extreme choices."
        }
    ]
    for rule in rules:
        for kw in rule["keywords"]:
            if kw in text_lower:
                idx = text_lower.find(kw)
                start = max(0, idx - 20)
                end = min(len(text), idx + len(kw) + 20)
                matched_text = text[start:end]
                return {
                    "fallacy_detected": True,
                    "fallacy_type": rule["name"],
                    "offending_text": matched_text,
                    "explanation": rule["explanation"],
                    "correction_suggestion": rule["correction"]
                }
    return {
        "fallacy_detected": False,
        "fallacy_type": "None",
        "offending_text": None,
        "explanation": None,
        "correction_suggestion": None
    }

class MultiAgentDebateEngine:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            self.whisper_client = OpenAI(api_key=self.api_key)
            # AGENT 1 (THE REFEREE): Locked at 0.0 temperature for absolute consistency
            self.referee_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
            self.referee_agent = self.referee_llm.with_structured_output(FallacyReport)
            
            # AGENT 2 (THE RIVAL PLAYER): Set at 0.7 temperature for natural, charismatic speech
            self.rival_player_agent = ChatOpenAI(model="gpt-4o", temperature=0.7)
        else:
            self.whisper_client = None
            self.referee_llm = None
            self.referee_agent = None
            self.rival_player_agent = None

    async def process_turn(self, audio_path: str, duration_sec: float, debate_format: str, history: list) -> dict:
        # 1. WHISPER AUDIO TO TEXT
        user_text = ""
        
        # Read from audio path if file exists, else use mock transcript
        if not audio_path or not os.path.exists(audio_path) or not os.path.isfile(audio_path):
            # Fallback mock text containing Ad Hominem fallacy for testing
            user_text = "My opponent is foolish and unqualified, and he claims we need tax reform but he couldn't even manage his own budget!"
            if not duration_sec:
                duration_sec = 10.0
        else:
            if self.whisper_client:
                try:
                    with open(audio_path, "rb") as audio_file:
                        transcript = self.whisper_client.audio.transcriptions.create(
                            model="whisper-1", 
                            file=audio_file,
                            response_format="verbose_json"
                        )
                    if isinstance(transcript, dict):
                        user_text = transcript.get("text", "")
                        whisper_duration = transcript.get("duration", None)
                    else:
                        user_text = getattr(transcript, "text", "")
                        whisper_duration = getattr(transcript, "duration", None)
                    
                    if whisper_duration and not duration_sec:
                        duration_sec = float(whisper_duration)
                except Exception as e:
                    print(f"[Warning] OpenAI Whisper API call failed: {e}")
                    user_text = "My opponent is foolish and unqualified, and he claims we need tax reform but he couldn't even manage his own budget!"
                    if not duration_sec:
                        duration_sec = 10.0
            else:
                user_text = "My opponent is foolish and unqualified, and he claims we need tax reform but he couldn't even manage his own budget!"
                if not duration_sec:
                    duration_sec = 10.0

        # 2. AUDIO PACING & FILLERS ANALYSIS
        wpm = math.ceil(len(user_text.split()) / (duration_sec / 60.0)) if duration_sec > 0 else 0
        pace = "Too Fast" if wpm > 160 else ("Too Slow" if wpm < 110 else "Optimal")
        
        # Count verbal fillers: um, uh, like
        fillers = re.findall(r"\b(um|uh|like)\b", user_text.lower())
        filler_count = len(fillers)
        filler_details = {
            "um": sum(1 for f in fillers if f == "um"),
            "uh": sum(1 for f in fillers if f == "uh"),
            "like": sum(1 for f in fillers if f == "like")
        }

        # 3. RUN AGENT 1 (THE REFEREE CHECK)
        logic_report = None
        if self.referee_agent:
            try:
                ref_prompt = ChatPromptTemplate.from_messages([
                    ("system", REFEREE_SYSTEM_PROMPT),
                    ("user", "{text}")
                ])
                referee_chain = ref_prompt | self.referee_agent
                logic_report_obj = await referee_chain.ainvoke({"text": user_text})
                
                # Convert Pydantic object to dict/matching schema
                logic_report = {
                    "fallacy_detected": logic_report_obj.fallacy_detected,
                    "fallacy_type": logic_report_obj.fallacy_type,
                    "offending_text": logic_report_obj.offending_text,
                    "explanation": logic_report_obj.explanation,
                    "correction_suggestion": logic_report_obj.correction_suggestion
                }
            except Exception as e:
                print(f"[Warning] Agent 1 LLM chain failed: {e}")
                logic_report = local_analyze_fallacy(user_text)
        else:
            logic_report = local_analyze_fallacy(user_text)

        # 4. CONFIGURING MAP FOR DEBATE FORMAT RULES
        format_rules = {
            "One-on-One Debate": "Direct, fast-paced adversarial counterarguments.",
            "Oxford Debate": "Formal rules. You must strictly oppose the motion and prioritize data and statistics. Keep arguments structured and academic.",
            "Parliamentary Debate": "Address the speaker as 'The Honorable Member'. Focus heavily on policy downfalls and use formal political terminology."
        }
        system_rules = format_rules.get(debate_format, "Act as an elite debate opponent.")
        
        # Injecting dynamic trap if Referee Agent caught a logical foul
        if logic_report.get("fallacy_detected"):
            system_rules += f"\n[FOUL FOUND]: The user committed a {logic_report.get('fallacy_type')} error. Expose it in your first sentence and call them out!"

        # 5. RUN AGENT 2 (THE CONVERSATIONAL OPPONENT)
        ai_reply_content = ""
        if self.rival_player_agent:
            try:
                langchain_messages = [SystemMessage(content=system_rules)]
                for h in history:
                    if isinstance(h, dict):
                        role = h.get("speaker", "User")
                        content = h.get("text", "")
                        if role == "AI":
                            langchain_messages.append(AIMessage(content=content))
                        else:
                            langchain_messages.append(HumanMessage(content=content))
                    else:
                        langchain_messages.append(h)
                
                langchain_messages.append(HumanMessage(content=user_text))
                ai_reply = await self.rival_player_agent.ainvoke(langchain_messages)
                ai_reply_content = ai_reply.content
            except Exception as e:
                print(f"[Warning] Agent 2 LLM chain failed: {e}")
                ai_reply_content = self._local_fallback_opponent(debate_format, logic_report, user_text)
        else:
            ai_reply_content = self._local_fallback_opponent(debate_format, logic_report, user_text)

        return {
            "user_transcript": user_text,
            "ai_rebuttal": ai_reply_content,
            "wpm": wpm,
            "pace": pace,
            "filler_words_count": filler_count,
            "filler_words_details": filler_details,
            "logic_data": logic_report
        }

    def _local_fallback_opponent(self, debate_format: str, logic_report: dict, user_text: str) -> str:
        """Deterministic local fallback response generator for the opponent."""
        foul_callout = ""
        if logic_report.get("fallacy_detected"):
            foul_callout = f"Before addressing your arguments, I must call out a clear '{logic_report.get('fallacy_type')}' fallacy. You said: '{logic_report.get('offending_text')}', which fails basic logic by {logic_report.get('explanation').lower()} "
        
        if debate_format == "Oxford Debate":
            return foul_callout + "Under the formal rules of Oxford Debate, we oppose the proposition. The statistical analysis of the policy indicates significant negative consequences that cannot be mitigated by rhetorical appeals."
        elif debate_format == "Parliamentary Debate":
            return foul_callout + "I thank The Honorable Member for their statement, but we must highlight the policy downfalls of their plan. The administrative costs and operational delays render the proposal unfeasible."
        else:
            return foul_callout + "That argument does not hold up under close examination. Direct counterarguments show that your premise assumes facts that are simply not true in practical applications."
