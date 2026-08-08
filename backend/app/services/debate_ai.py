import os
import random
import re
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from typing import Optional
from backend.app.services.fallacy import analyze_fallacies, calculate_credibility_assessment
from backend.app.services.argument_analysis import analyze_argument_structure

class FallacyReport(BaseModel):
    fallacy_detected: bool = Field(description="True ONLY if a fallacy is committed.")
    fallacy_type: str = Field(description="Must be 'Ad Hominem', 'Straw Man', 'False Dilemma', 'Slippery Slope', 'Appeal to Authority', 'Circular Reasoning', 'Hasty Generalization', 'Red Herring', or 'None'.")
    offending_text: Optional[str] = Field(default=None, description="The broken phrase.")
    explanation: Optional[str] = Field(default=None, description="Why the reasoning failed.")
    correction_suggestion: Optional[str] = Field(default=None, description="How to correct this error.")

REFEREE_SYSTEM_PROMPT = """You are an elite, objective debate coach acting as a logical fallacy referee.
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

def analyze_user_argument(text: str, topic: str, format: str) -> Dict[str, Any]:
    """
    Evaluates speech/text reasoning by coordinating Module 4 (Argument Analysis Engine)
    and Module 5 (Logical Fallacy Detection Engine) hand-in-hand.
    """
    words = text.lower().split()
    word_count = len(words)
    
    # 1. Module 5: Logical Fallacy Detection Engine
    api_key = os.getenv("OPENAI_API_KEY")
    fallacies = []
    if api_key and "mock_key" not in api_key:
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            referee_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0, api_key=api_key)
            referee_agent = referee_llm.with_structured_output(FallacyReport)
            ref_prompt = ChatPromptTemplate.from_messages([
                ("system", REFEREE_SYSTEM_PROMPT),
                ("user", "{text}")
            ])
            referee_chain = ref_prompt | referee_agent
            logic_report = referee_chain.invoke({"text": text})
            
            if logic_report.fallacy_detected:
                fallacies.append({
                    "fallacy": logic_report.fallacy_type,
                    "severity": "High" if logic_report.fallacy_type in ["Ad Hominem", "Straw Man", "Circular Reasoning"] else "Medium",
                    "explanation": logic_report.explanation,
                    "correction": logic_report.correction_suggestion,
                    "match": logic_report.offending_text,
                    "offending_text": logic_report.offending_text
                })
        except Exception as e:
            print(f"[Warning] LLM fallacy detection failed: {e}")
            fallacies = analyze_fallacies(text)
    else:
        fallacies = analyze_fallacies(text)
        
    credibility_report = calculate_credibility_assessment(fallacies, text)
    
    # 2. Module 4: Argument Analysis Engine
    struct_analysis = analyze_argument_structure(text, topic=topic, fallacy_count=len(fallacies))
    
    # 3. Generate Tactical Rebuttal Hints
    fillers = re.findall(r"\b(um|uh|like|you know)\b", text.lower())
    filler_count = len(fillers)
    rebuttal_hints = []
    
    if fallacies:
        for f in fallacies:
            rebuttal_hints.append(f"Quality Control Warning: '{f['fallacy']}' fallacy detected. {f['correction']}")
    if filler_count > 0:
        rebuttal_hints.append(f"Spoken Pacing Note: {filler_count} verbal filler(s) detected. Pausing deliberately improves structural clarity.")
    if struct_analysis["scores"]["evidence_strength"] < 60:
        rebuttal_hints.append("Evidence Enhancement: Incorporate statistical data, studies, or empirical case studies to strengthen argument foundation.")
    if struct_analysis["scores"]["logical_consistency"] < 70:
        rebuttal_hints.append("Logic Connection: Use transitional linkers ('therefore', 'consequently', 'on the other hand') to connect premises cleanly.")
    if word_count < 25:
        rebuttal_hints.append("Elaboration Required: Expand premises by articulating the core claim, supporting evidence, and impact.")
        
    if not rebuttal_hints:
        rebuttal_hints.append("Solid Argumentation: Core claims are well supported. Next, anticipate opposition rebuttals and preemptively counter them.")

    return {
        "scores": struct_analysis["scores"],
        "fallacies": fallacies,
        "credibility_score": credibility_report["credibility_score"],
        "extracted_claims": struct_analysis["extracted_claims"],
        "evaluated_evidence": struct_analysis["evaluated_evidence"],
        "reasoning_quality": struct_analysis["reasoning_quality"],
        "argument_strength": struct_analysis["argument_strength"],
        "rebuttal_hints": rebuttal_hints
    }


def generate_ai_response(
    topic: str,
    format: str,
    user_position: str,
    ai_personality: str,
    conversation_history: List[Dict[str, str]],
    provider: str = "Local Simulation Engine"
) -> str:
    """
    Generates the AI opponent's response matching its personality, stance, and model provider style across all 6 debate formats.
    """
    ai_position = "Con" if user_position in ["Pro", "Government", "Affirmative"] else "Pro"
    
    # Extract last user speech and check for fallacies
    last_user_text = ""
    for turn in reversed(conversation_history):
        if turn["speaker"] == "User":
            last_user_text = turn["text"]
            break

    user_fallacies = analyze_fallacies(last_user_text) if last_user_text else []
    
    # Setup dynamic trap exploit instruction if the user committed a fallacy
    exploit_instruction = ""
    if user_fallacies:
        f = user_fallacies[0]
        exploit_instruction = (
            f"\n[FOUL EXPLOITATION]: The user committed a logical fallacy of type '{f['fallacy']}' "
            f"in their statement (offending section: '{f.get('match', '')}'). "
            f"In your opening sentence, call out this logical foul directly and mock or dissect their bad reasoning!"
        )
    
    # Define format-specific framing guidelines for all 6 formats
    format_rules_map = {
        "One-on-One Debate": "Direct, fast-paced adversarial counterarguments focusing on core premises.",
        "Parliamentary Debate": "Address speaker as 'The Honorable Member'. Emphasize policy downfalls, governance costs, and parliamentary protocol.",
        "Oxford Debate": "Strict formal rules. Focus heavily on academic evidence, statistical data, and opposing the motion firmly.",
        "Policy Debate": "Structure rebuttal around Policy Plan, Harms, Solvency, Disadvantages, and Counter-plans.",
        "Public Forum Debate": "Use clear, accessible, public-oriented arguments focusing on economic and societal impacts.",
        "AI Debate Simulation": "Fully roleplay the designated AI personality against the user in a dynamic simulation environment."
    }
    format_guidance = format_rules_map.get(format, "Engage in rigorous, structured debate.")

    # 1. Real API Mode (If OpenAI API Key exists)
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and "mock_key" not in api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            
            provider_style_guide = ""
            if "gemini" in provider.lower():
                provider_style_guide = "Style: You are Google Gemini. Structure thoughts with clear bullet points or numbered lists."
            elif "claude" in provider.lower():
                provider_style_guide = "Style: You are Anthropic Claude. Provide deep, academic, highly nuanced reasoning."
            elif "openai" in provider.lower():
                provider_style_guide = "Style: You are OpenAI GPT-4o. Provide direct, sharp, rhetorically compelling counter-points."
            else:
                provider_style_guide = "Provide a concise, professional debate rebuttal."
            
            system_content = (
                f"You are a master debater in a '{format}' debate on topic: '{topic}'.\n"
                f"Format Protocol: {format_guidance}\n"
                f"Your Position: '{ai_position}' (User position is '{user_position}').\n"
                f"AI Persona: '{ai_personality}'.\n"
                f"{provider_style_guide}\n"
                f"Limit response to 2-3 structured paragraphs."
            )
            
            if exploit_instruction:
                system_content += exploit_instruction
            
            messages = [{"role": "system", "content": system_content}]
            for turn in conversation_history:
                role = "user" if turn["speaker"] == "User" else "assistant"
                messages.append({"role": role, "content": turn["text"]})
                
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=350,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[Warning] OpenAI API debate turn failed: {e}")

    # 2. Local Simulation Engine
    subject = "this motion"
    if last_user_text:
        nouns = re.findall(r"\b(economy|health|freedom|rights|safety|technology|future|society|education|jobs|progress|policy)\b", last_user_text.lower())
        subject = nouns[0] if nouns else "this motion"
    
    # Personality-driven templates
    if ai_personality == "Socrates":
        templates = [
            f"Let us examine that premise more closely. You assert that {subject} requires this immediate action. But what is the foundational principle underlying your claim? If we adopt your framework, do we not create a severe systemic contradiction?",
            f"Your perspective raises an essential question: How do you reconcile your claim on {subject} with empirical reality? An argument built solely on short-term stability crumbles under ethical scrutiny.",
            f"I hear your point, but let us look at the causal link. You assume that backing your position naturally safeguards {subject}. Yet is it not equally likely to trigger the exact crisis you seek to avert?"
        ]
    elif ai_personality == "Aggressor":
        templates = [
            f"That argument is fundamentally untenable! Focusing on {subject} completely ignores the central flaw of your case. You are asking us to accept immense risk with zero empirical backing!",
            f"Let us be direct: your claims regarding {subject} are built on speculation, not substance. In any real-world test, your proposed model collapses under fiscal pressure.",
            f"Your assertion is misleading. The opposition continuously highlights {subject} to divert attention from the core issue: the immediate, negative fallout of your proposal."
        ]
    else:  # Pragmatist
        templates = [
            f"From a practical standpoint, we must evaluate resource allocation. While protecting {subject} sounds ideal, cost-benefit analysis demonstrates a clear negative return.",
            f"Let us look at empirical data. Past implementations indicate that prioritizing {subject} without structural safeguards produces severe administrative bloat.",
            f"The pragmatic stance is straightforward: feasibility matters. Your stance on {subject} assumes unlimited resources and flawless execution, which is unachievable in practice."
        ]

    base_response = random.choice(templates)
    
    # Prepend local foul exploit trap callout
    foul_callout = ""
    if user_fallacies:
        f = user_fallacies[0]
        foul_callout = (
            f"Before addressing your arguments, I must call out a clear '{f['fallacy']}' foul. "
            f"You stated: '{f.get('match', '')}', which fails basic logic by {f['explanation'].lower()} "
        )
    
    base_response = foul_callout + base_response
    
    # Format-specific wrapping
    if format == "Parliamentary Debate":
        return f"I thank The Honorable Member for their statement. {base_response} As the Opposition bench, we urge a vote against the motion."
    elif format == "Oxford Debate":
        return f"Under formal Oxford rules, we firmly oppose the motion. {base_response} The empirical weight rests entirely with the Negative."
    elif format == "Policy Debate":
        return f"Regarding Plan Solvency and Disadvantages: {base_response} The status quo remains vastly superior to the proposed plan."
    elif format == "Public Forum Debate":
        return f"Looking at the public impact: {base_response} Everyday citizens will bear the cost of this flawed proposal."
    else:
        return f"[Format: {format}] {base_response}"


def generate_rebuttal_strategies(
    topic: str,
    format: str,
    user_position: str,
    ai_personality: str,
    last_ai_turn: str,
    provider: str = "Local Simulation Engine"
) -> List[Dict[str, str]]:
    """
    Generates three distinct tactical rebuttal strategies against the AI's last turn.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and "mock_key" not in api_key:
        try:
            from openai import OpenAI
            import json
            client = OpenAI(api_key=api_key)
            prompt = (
                f"You are a debate coach. The debate topic is '{topic}', format is '{format}'.\n"
                f"The AI opponent (position: {'Con' if user_position == 'Pro' else 'Pro'}, personality: '{ai_personality}') said:\n"
                f"'{last_ai_turn}'\n\n"
                f"Provide exactly 3 rebuttal strategies for the User (position: '{user_position}') to counter the AI's argument.\n"
                f"Return a strict JSON list of objects, each having the keys:\n"
                f"1. 'strategy_name': Short name of the strategic tactic.\n"
                f"2. 'description': Brief explanation of why this strategy is effective.\n"
                f"3. 'starter_text': A complete opening paragraph template for the user.\n"
                f"Output only raw JSON. No code block formatting."
            )
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.7
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = re.sub(r"^```(?:json)?\n", "", content)
                content = re.sub(r"\n```$", "", content)
            return json.loads(content)
        except Exception:
            pass

    # Deterministic Local Fallback
    nouns = re.findall(r"\b(economy|resource|ethical|moral|stability|cost|data|evidence|autonomy|premise)\b", last_ai_turn.lower())
    keyword = nouns[0] if nouns else "assumptions"

    strategies = [
        {
            "strategy_name": "Logical Refutation (Deconstruct Premise)",
            "description": f"Target the opponent's core premise concerning '{keyword}' by showing a lack of structural or logical connection.",
            "starter_text": f"The opponent builds their entire argument on the premise of '{keyword}'. However, this logic is flawed because it assumes a linear cause-and-effect relationship, failing to account for the fact that..."
        },
        {
            "strategy_name": "Empirical Challenge (Call for Evidence)",
            "description": f"Challenge the opponent's assertion regarding '{keyword}' by pointing out the lack of concrete, verifiable data.",
            "starter_text": f"While the opposition paints a dramatic picture of issues surrounding '{keyword}', they offer no empirical case studies or statistical backing. A rigorous debate demands evidence, not merely hypothetical claims that..."
        },
        {
            "strategy_name": "Pragmatic Re-framing (Shift Perspective)",
            "description": "Re-frame the discussion to focus on systemic, real-world impacts rather than theoretical scenarios.",
            "starter_text": "Rather than getting lost in the opponent's theoretical speculation, let us look at the direct, practical reality of this policy. In practice, the primary concern is not their idealized outcome, but rather..."
        }
    ]
    return strategies
