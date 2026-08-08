import math
from typing import Dict, Any, List, Optional

def calculate_weighted_performance_score(
    argument_quality: float,
    evidence_usage: float,
    logical_consistency: float,
    rebuttal_effectiveness: float,
    communication_skills: float
) -> Dict[str, Any]:
    """
    Step 3: Implement the Performance Scoring Engine.
    Calculates overall Debate Performance Score using the exact formal weighted model:
    Debate Performance Score = (30% * Argument Quality) +
                               (20% * Evidence Usage) +
                               (20% * Logical Consistency) +
                               (15% * Rebuttal Effectiveness) +
                               (15% * Communication Skills)
    """
    # Ensure all sub-scores are bounded within 0.0 to 100.0
    arg_q = max(0.0, min(100.0, float(argument_quality)))
    ev_u = max(0.0, min(100.0, float(evidence_usage)))
    log_c = max(0.0, min(100.0, float(logical_consistency)))
    reb_e = max(0.0, min(100.0, float(rebuttal_effectiveness)))
    com_s = max(0.0, min(100.0, float(communication_skills)))

    total_score = (
        (0.30 * arg_q) +
        (0.20 * ev_u) +
        (0.20 * log_c) +
        (0.15 * reb_e) +
        (0.15 * com_s)
    )

    total_score = round(max(0.0, min(100.0, total_score)), 1)

    # Calculate qualitative tier
    if total_score >= 90.0:
        performance_tier = "Master Debater"
    elif total_score >= 80.0:
        performance_tier = "Advanced Competitor"
    elif total_score >= 70.0:
        performance_tier = "Proficient Speaker"
    elif total_score >= 60.0:
        performance_tier = "Developing Practitioner"
    else:
        performance_tier = "Novice Learner"

    return {
        "overall_score": total_score,
        "performance_tier": performance_tier,
        "breakdown": {
            "argumentation": round(arg_q, 1),
            "evidence_usage": round(ev_u, 1),
            "logical_consistency": round(log_c, 1),
            "rebuttal_effectiveness": round(reb_e, 1),
            "communication_skills": round(com_s, 1)
        },
        "weights": {
            "argumentation": "30%",
            "evidence_usage": "20%",
            "logical_consistency": "20%",
            "rebuttal_effectiveness": "15%",
            "communication_skills": "15%"
        }
    }

def verify_score_consistency(scores_list: List[float], max_allowed_variance: float = 5.0) -> bool:
    """
    Consistency Check (Section 5.2): Confirms score variance stays within small bounds across repeated runs.
    """
    if not scores_list or len(scores_list) < 2:
        return True
    mean = sum(scores_list) / len(scores_list)
    variance = sum((x - mean) ** 2 for x in scores_list) / len(scores_list)
    std_dev = math.sqrt(variance)
    return std_dev <= max_allowed_variance
