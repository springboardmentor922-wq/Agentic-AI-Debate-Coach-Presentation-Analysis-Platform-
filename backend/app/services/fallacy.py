import re
from typing import List, Dict, Any

FALLACY_RULES = [
    {
        "name": "Ad Hominem",
        "severity": "High",
        "patterns": [
            r"\b(foolish|ignorant|stupid|hypocritical|unqualified|corrupt|idiot|naive|childish|bias)\b",
            r"(you only say that|because you are|your kind of people|don't have the brains)"
        ],
        "explanation": "Attacking the opponent's character or credentials directly instead of answering their argument.",
        "correction": "Focus on the logic, facts, and evidence of the opponent's argument rather than their personal traits or motives."
    },
    {
        "name": "Straw Man",
        "severity": "High",
        "patterns": [
            r"\b(completely ignore|total disregard|destroy all|ban all|eliminate every|wants to destroy|claims that everything)\b",
            r"(so you're saying we should just|wants us to go back to the stone age)"
        ],
        "explanation": "Misrepresenting or oversimplifying an opponent's position to make it easier to attack.",
        "correction": "Represent your opponent's arguments accurately and charitably before criticizing them."
    },
    {
        "name": "False Dilemma",
        "severity": "Medium",
        "patterns": [
            r"\b(either we|only two choices|must choose between|no other option|if we don't.*we will face total ruin)\b",
            r"(either.*or.*nothing else)"
        ],
        "explanation": "Presenting only two options or outcomes when more possibilities actually exist.",
        "correction": "Acknowledge the nuances and alternative courses of action that exist between extreme choices."
    },
    {
        "name": "Slippery Slope",
        "severity": "Medium",
        "patterns": [
            r"\b(leads directly to|opens the floodgates|inevitably lead|will end up in|will destroy civilization|first step to total collapse)\b",
            r"(if we allow.*then next.*will happen)"
        ],
        "explanation": "Arguing that a relatively small first step will inevitably lead to a chain of catastrophic events without providing logical proof.",
        "correction": "Provide concrete causal links showing why one action will directly trigger the subsequent chain of events."
    },
    {
        "name": "Appeal to Authority",
        "severity": "Medium",
        "patterns": [
            r"\b(experts say|scientists agree|everyone knows|studies prove|trust me when I say)\b",
            r"(a famous.*said|authorities confirm)"
        ],
        "explanation": "Claiming something is true solely because an authority figure said it, without citing verification or actual evidence.",
        "correction": "Cite specific, relevant, and credible studies, authors, or data, and explain the logical basis of their conclusions."
    },
    {
        "name": "Circular Reasoning",
        "severity": "High",
        "patterns": [
            r"\b(is true because it is|because it's a fact|obviously true since it's|by definition it is)\b",
            r"(proves itself|self-evident and therefore)"
        ],
        "explanation": "Supporting a premise with the premise itself, repeating the claim in different words instead of proving it.",
        "correction": "Introduce independent external evidence or separate logical steps to prove your core claims."
    },
    {
        "name": "Hasty Generalization",
        "severity": "Medium",
        "patterns": [
            r"\b(always|never|everyone|nobody|every single time|based on my experience|my friend said)\b",
            r"(seen it once.*so it's always)"
        ],
        "explanation": "Drawing a broad conclusion based on a small or unrepresentative sample size.",
        "correction": "Use qualifiers like 'often', 'many', or 'some', and back up general claims with broader statistical evidence."
    },
    {
        "name": "Red Herring",
        "severity": "Medium",
        "patterns": [
            r"\b(but what about|let's look at|ignoring the real issue|why aren't we talking about|a different question is)\b",
            r"(irrelevant to this but|diverting our attention to)"
        ],
        "explanation": "Introducing an irrelevant topic to divert attention away from the original argument.",
        "correction": "Stay on topic. Answer the direct question or point being debated before addressing other issues."
    }
]

def analyze_fallacies(text: str) -> List[Dict[str, Any]]:
    """
    Scans text for logical fallacies across all 8 supported rules.
    """
    detected = []
    text_lower = text.lower()
    
    for rule in FALLACY_RULES:
        matches = []
        for pattern in rule["patterns"]:
            for m in re.finditer(pattern, text_lower):
                start = max(0, m.start() - 15)
                end = min(len(text), m.end() + 15)
                matched_snippet = text[start:end].strip()
                if matched_snippet not in [item.get("match") for item in matches]:
                    matches.append({
                        "match": matched_snippet,
                        "start": m.start(),
                        "end": m.end()
                    })
        
        if matches:
            detected.append({
                "fallacy": rule["name"],
                "severity": rule["severity"],
                "explanation": rule["explanation"],
                "correction": rule["correction"],
                "match": matches[0]["match"],
                "offending_text": matches[0]["match"],
                "occurrences": matches
            })
            
    return detected

def calculate_credibility_assessment(fallacies: List[Dict[str, Any]], text: str) -> Dict[str, Any]:
    """
    Module 5: Credibility & Quality-Control Assessment
    Calculates argument credibility score based on logical flaws and severity.
    """
    word_count = len(text.split())
    if word_count < 10:
        return {
            "has_fallacy": len(fallacies) > 0,
            "credibility_score": 50.0,
            "reasoning_analysis": "Speech sample is too brief to establish strong logical credibility.",
            "summary": "Short input requires elaboration."
        }
        
    base_credibility = 100.0
    for f in fallacies:
        severity = f.get("severity", "Medium")
        penalty = 25.0 if severity == "High" else 15.0
        base_credibility -= penalty
        
    credibility_score = max(10.0, round(base_credibility, 1))
    
    if len(fallacies) == 0:
        analysis = "Clean logical structure. No major logical fallacies were detected. The argument maintains credibility."
        summary = "No logical fouls identified."
    else:
        fallacy_names = [f["fallacy"] for f in fallacies]
        analysis = f"Quality control filter flagged {len(fallacies)} logical flaw(s): {', '.join(fallacy_names)}. These flaws undermine premise validity."
        summary = f"Identified {len(fallacies)} logical fallacy fouls."
        
    return {
        "has_fallacy": len(fallacies) > 0,
        "credibility_score": credibility_score,
        "reasoning_analysis": analysis,
        "summary": summary
    }
