import re
import math
import os
from typing import Dict, Any, List

def extract_claims(text: str) -> List[Dict[str, Any]]:
    """
    Module 4: Claim Identification
    Extracts core claims, sub-claims, and propositions from text.
    """
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if len(s.strip()) > 5]
    claims = []
    
    claim_indicators = [
        "argue that", "believe that", "assert that", "claim that", "propose that",
        "should", "must", "will lead to", "the fact is", "it is vital that", "therefore",
        "consequently", "our stance is", "the primary issue is"
    ]
    
    for idx, sentence in enumerate(sentences):
        sent_lower = sentence.lower()
        has_indicator = any(ind in sent_lower for ind in claim_indicators)
        
        if idx == 0 or has_indicator:
            claim_type = "Core Claim" if idx == 0 else "Sub Claim"
            confidence = 0.95 if has_indicator else 0.80
            claims.append({
                "claim": sentence,
                "type": claim_type,
                "confidence": confidence
            })
            
    if not claims and sentences:
        claims.append({
            "claim": sentences[0],
            "type": "Core Claim",
            "confidence": 0.75
        })
        
    return claims

def evaluate_evidence(text: str) -> List[Dict[str, Any]]:
    """
    Module 4: Evidence Evaluation
    Scans text for empirical data, statistical citations, study references, expert quotes, and assertions.
    """
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if len(s.strip()) > 5]
    evidence_list = []
    
    stat_pattern = r"(\b\d+(\.\d+)?%\b|\b\d+\s*(percent|percentile|billion|million|trillion|dollars|people)\b|\b(study|research|report|data|survey|analysis)\b)"
    expert_pattern = r"\b(according to|cited by|dr\.|professor|expert|institute|university|journal|published in)\b"
    example_pattern = r"\b(for example|for instance|such as|case in point|historically)\b"
    
    for sentence in sentences:
        sent_lower = sentence.lower()
        if re.search(stat_pattern, sent_lower):
            evidence_list.append({
                "evidence_text": sentence,
                "type": "Statistical / Quantitative Data",
                "weight": 0.90
            })
        elif re.search(expert_pattern, sent_lower):
            evidence_list.append({
                "evidence_text": sentence,
                "type": "Authoritative Citation",
                "weight": 0.85
            })
        elif re.search(example_pattern, sent_lower):
            evidence_list.append({
                "evidence_text": sentence,
                "type": "Empirical Example / Case Study",
                "weight": 0.75
            })
            
    if not evidence_list and sentences:
        evidence_list.append({
            "evidence_text": sentences[-1] if len(sentences) > 1 else sentences[0],
            "type": "Qualitative Assertion",
            "weight": 0.45
        })
        
    return evidence_list

def analyze_reasoning_quality(text: str, claims: List[Dict[str, Any]], evidence: List[Dict[str, Any]], fallacy_count: int) -> str:
    """
    Module 4: Reasoning Quality Analysis
    Evaluates the structural coherence connecting premises, claims, and evidence.
    """
    words = text.split()
    word_count = len(words)
    
    if word_count < 15:
        return "Reasoning is underdeveloped due to brief length. Expand premises with supporting empirical evidence."
        
    logical_connectors = ["therefore", "because", "however", "consequently", "thus", "implies", "since", "furthermore", "on the other hand"]
    connector_count = sum(1 for w in words if w.lower() in logical_connectors)
    
    high_weight_evidence = sum(1 for e in evidence if e.get("weight", 0) >= 0.75)
    
    if fallacy_count > 0:
        return f"Reasoning exhibits logical vulnerabilities ({fallacy_count} fallacy detected). While claims are stated, the logical chain contains flawed premises."
    elif connector_count >= 2 and high_weight_evidence >= 1:
        return "Exemplary reasoning quality. Claims are logically structured with strong transitional connectors and empirical evidence backing."
    elif connector_count >= 1 or high_weight_evidence >= 1:
        return "Moderate reasoning quality. Premises logically connect to claims, but further statistical or empirical data would solidify the argument."
    else:
        return "Basic reasoning structure. The argument relies primarily on assertion. Adding transitional connectors and verifiable evidence will elevate logic."

def analyze_argument_structure(text: str, topic: str = "General Debate", fallacy_count: int = 0) -> Dict[str, Any]:
    """
    Main Module 4 Engine function evaluating text across all 5 criteria.
    """
    words = text.lower().split()
    word_count = len(words)
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    
    # 1. Claim Identification & Extraction
    claims = extract_claims(text)
    
    # 2. Evidence Evaluation
    evidence = evaluate_evidence(text)
    
    # 3. 5 Evaluation Criteria Calculations
    
    # A. Clarity
    fillers = re.findall(r"\b(um|uh|like|you know|basically|actually)\b", text.lower())
    filler_count = len(fillers)
    
    if not sentences:
        clarity_score = 30.0
    else:
        avg_sentence_len = word_count / len(sentences)
        if 10 <= avg_sentence_len <= 20:
            clarity_score = 95.0
        else:
            clarity_score = max(40.0, 100.0 - abs(15.0 - avg_sentence_len) * 2.5)
    clarity_score = max(10.0, clarity_score - (filler_count * 8.0))
    
    # B. Relevance
    topic_words = set(re.findall(r"\b\w{3,}\b", topic.lower()))
    text_words = set(re.findall(r"\b\w{3,}\b", text.lower()))
    overlap = len(topic_words.intersection(text_words))
    relevance_score = min(100.0, 55.0 + (overlap * 10.0))
    if word_count < 10:
        relevance_score = max(20.0, relevance_score - 25.0)
        
    # C. Evidence Strength
    total_evidence_weight = sum(e.get("weight", 0.5) for e in evidence)
    evidence_score = min(100.0, 35.0 + (total_evidence_weight * 35.0))
    if word_count < 15:
        evidence_score = max(10.0, evidence_score - 25.0)
        
    # D. Logical Consistency
    logic_words = ["therefore", "because", "however", "consequently", "thus", "implies", "leads to", "since", "furthermore"]
    logic_matches = sum(1 for w in logic_words if w in text.lower())
    logical_consistency = 95.0 - (fallacy_count * 20.0) + (logic_matches * 4.0)
    logical_consistency = max(15.0, min(100.0, logical_consistency))
    
    # E. Persuasiveness (Weighted Synthesis)
    persuasiveness = (
        (evidence_score * 0.30) +
        (logical_consistency * 0.30) +
        (clarity_score * 0.20) +
        (relevance_score * 0.20)
    )
    persuasiveness = round(max(10.0, min(100.0, persuasiveness)), 1)
    
    # 4. Overall Argument Strength
    argument_strength = round((persuasiveness * 0.6) + (logical_consistency * 0.4), 1)
    
    # 5. Reasoning Quality Synthesis
    reasoning_quality = analyze_reasoning_quality(text, claims, evidence, fallacy_count)
    
    return {
        "extracted_claims": claims,
        "evaluated_evidence": evidence,
        "reasoning_quality": reasoning_quality,
        "argument_strength": argument_strength,
        "scores": {
            "clarity": round(clarity_score, 1),
            "relevance": round(relevance_score, 1),
            "evidence_strength": round(evidence_score, 1),
            "logical_consistency": round(logical_consistency, 1),
            "persuasiveness": persuasiveness
        }
    }
