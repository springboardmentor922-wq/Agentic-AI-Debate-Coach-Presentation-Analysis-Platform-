import os
import re
from typing import Dict, List, Any
from pydantic import BaseModel, Field
from typing import Optional
from backend.app.services.fallacy import analyze_fallacies

FILLER_WORDS = ["um", "uh", "ah", "like", "basically", "you know", "actually", "literally", "so"]

class FallacyReport(BaseModel):
    fallacy_detected: bool = Field(description="True ONLY if a fallacy is committed.")
    fallacy_type: str = Field(description="Must be 'Ad Hominem', 'Straw Man', 'False Dilemma', 'Slippery Slope', 'Appeal to Authority', 'Circular Reasoning', 'Hasty Generalization', 'Red Herring', or 'None'.")
    offending_text: Optional[str] = Field(default=None, description="The broken phrase.")
    explanation: Optional[str] = Field(default=None, description="Why the reasoning failed.")
    correction_suggestion: Optional[str] = Field(default=None, description="How to correct this error.")

REFEREE_SYSTEM_PROMPT = """You are an elite, objective debate coach acting as a logical fallacy referee.
Analyze the user's presentation text and determine if any of the following logical fallacies are committed:
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

def analyze_speech_delivery(transcript: str, duration: float) -> Dict[str, Any]:
    """
    Analyzes presentation delivery based on the transcript and duration.
    Calculates filler words, pace (WPM), clarity, confidence, and overall score.
    Runs LLM fallacy auditing and generates specialized coaching comments if API is present.
    """
    words = re.findall(r"\b\w+\b", transcript.lower())
    word_count = len(words)
    
    # Avoid division by zero
    if duration <= 0:
        duration = max(word_count / 2.5, 5.0)  # assume average speaking speed of 150 WPM (2.5 words/sec)

    # 1. Calculate Pace (WPM)
    wpm = int(word_count / (duration / 60.0))
    
    # Pace scoring: 130-160 WPM is optimal (100 pts)
    # Outside that range, deduct points
    if 130 <= wpm <= 160:
        pace_score = 100
    elif wpm < 130:
        pace_score = max(40, 100 - (130 - wpm) * 1.5)  # slow
    else:
        pace_score = max(40, 100 - (wpm - 160) * 1.5)  # fast
        
    # 2. Count Filler Words
    filler_counts = {}
    total_fillers = 0
    for filler in FILLER_WORDS:
        pattern = re.compile(rf"\b{filler}\b", re.IGNORECASE)
        count = len(pattern.findall(transcript))
        if count > 0:
            filler_counts[filler] = count
            total_fillers += count

    # 3. Confidence Score
    filler_density = total_fillers / max(word_count, 1)
    filler_penalty = min(50, filler_density * 250)
    pace_penalty = (100 - pace_score) * 0.3
    confidence_score = round(max(30.0, 100.0 - filler_penalty - pace_penalty), 1)

    # 4. Clarity Score
    sentences = re.split(r"[.!?]+", transcript)
    sentences = [s.strip() for s in sentences if s.strip()]
    sentence_count = len(sentences)
    
    if sentence_count == 0:
        clarity_score = 50.0
    else:
        avg_sentence_len = word_count / sentence_count
        if 10 <= avg_sentence_len <= 20:
            length_score = 100
        else:
            length_score = max(50, 100 - abs(15 - avg_sentence_len) * 2)
            
        unique_words = len(set(words))
        vocab_score = (unique_words / max(word_count, 1)) * 100
        vocab_score = min(100, vocab_score * 1.2)
        
        clarity_score = round((length_score * 0.6) + (vocab_score * 0.4), 1)

    # 5. Logical Fallacies (Zero-Drift LLM Auditing)
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
            logic_report = referee_chain.invoke({"text": transcript})
            
            if logic_report.fallacy_detected:
                fallacies.append({
                    "fallacy": logic_report.fallacy_type,
                    "occurrences": [{"match": logic_report.offending_text}],
                    "explanation": logic_report.explanation,
                    "correction": logic_report.correction_suggestion
                })
        except Exception as e:
            print(f"[Warning] Presentation LLM fallacy auditing failed: {e}")
            fallacies = analyze_fallacies(transcript)
    else:
        fallacies = analyze_fallacies(transcript)
        
    fallacy_penalty = min(40, len(fallacies) * 10)

    # 6. Presentation Vocal Coach Feedback
    coach_feedback_text = ""
    if api_key and "mock_key" not in api_key:
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.messages import SystemMessage, HumanMessage
            
            coach_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, api_key=api_key)
            prompt = (
                f"Transcript: '{transcript}'\n"
                f"Duration: {duration} seconds\n"
                f"Pace: {wpm} WPM\n"
                f"Filler Word Count: {total_fillers} total filler occurrences ({filler_counts}).\n"
                f"Confidence Score: {confidence_score}%\n"
                f"Clarity Score: {clarity_score}%\n"
            )
            coach_system = (
                "You are an elite presentation coach. Analyze the user's speech statistics and transcript "
                "to provide a concise review of their vocal delivery. Provide direct suggestions on how they can improve "
                "their speed, pauses, and confidence. Keep your feedback limited to 3 sentences, encouraging but professional."
            )
            response = coach_llm.invoke([
                SystemMessage(content=coach_system),
                HumanMessage(content=prompt)
            ])
            coach_feedback_text = response.content.strip()
            
            # Pack feedback directly into fallacies list as an advanced card
            fallacies.append({
                "fallacy": "Vocal Delivery Coach Comments",
                "occurrences": [{"match": "Vocal Presentation Overview"}],
                "explanation": coach_feedback_text,
                "correction": "Speak with deliberate transitions, regulate pacing, and minimize filler word usage."
            })
        except Exception as e:
            print(f"[Warning] Presentation Vocal Coach generation failed: {e}")
            
    # 7. Overall Performance Score
    overall_score = round(
        ((pace_score * 0.3) + (confidence_score * 0.3) + (clarity_score * 0.4)) - fallacy_penalty,
        1
    )
    overall_score = max(10.0, min(100.0, overall_score))

    return {
        "duration": round(duration, 1),
        "pace": wpm,
        "filler_word_count": filler_counts,
        "total_fillers": total_fillers,
        "clarity_score": clarity_score,
        "confidence_score": confidence_score,
        "fallacies_json": fallacies,
        "overall_score": overall_score
    }
