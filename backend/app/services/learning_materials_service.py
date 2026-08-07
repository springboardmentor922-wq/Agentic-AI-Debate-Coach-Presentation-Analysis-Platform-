"""
Learning Materials recommender (Milestone 4, Part 11 of the spec).

The catalog below is a fixed, real set of material *descriptions* (title,
type, level, tags) — no fabricated URLs or claims about specific external
publishers are made. What's dynamic, per the spec's requirement, is the
selection: which materials surface and in what order is computed from the
learner's real detected weaknesses/fallacies, not shown identically to
everyone.
"""
CATALOG = [
    {"title": "Foundations of Logical Fallacies", "type": "Article", "level": "Beginner", "tags": ["fallacy", "logic", "critical thinking"]},
    {"title": "Mastering Cross-Examination", "type": "Video", "level": "Intermediate", "tags": ["cross examination", "confidence", "rebuttal"]},
    {"title": "Advanced Rebuttal Frameworks", "type": "Video", "level": "Advanced", "tags": ["rebuttal", "argument structure"]},
    {"title": "Evidence Evaluation Toolkit", "type": "PDF", "level": "Intermediate", "tags": ["evidence", "citation", "statistic"]},
    {"title": "Sample Oxford-Style Debate", "type": "Debate Example", "level": "Intermediate", "tags": ["format", "oxford", "structure"]},
    {"title": "Sample Parliamentary Debate", "type": "Debate Example", "level": "Intermediate", "tags": ["format", "parliamentary", "structure"]},
    {"title": "The Art of Persuasion", "type": "TED Talk", "level": "Beginner", "tags": ["persuasion", "rhetoric", "emotion"]},
    {"title": "How to Speak So People Want to Listen", "type": "TED Talk", "level": "Beginner", "tags": ["clarity", "confidence", "delivery", "public speaking"]},
    {"title": "Thank You for Arguing", "type": "Book", "level": "Advanced", "tags": ["rhetoric", "persuasion", "argument structure"]},
    {"title": "Straw Man vs Steel Man Arguments", "type": "Article", "level": "Intermediate", "tags": ["fallacy", "straw man", "argument structure"]},
    {"title": "Building a Winning Case Structure", "type": "PDF", "level": "Intermediate", "tags": ["case building", "structure", "policy"]},
    {"title": "Reducing Filler Words Under Pressure", "type": "Video", "level": "Beginner", "tags": ["clarity", "confidence", "delivery", "filler"]},
]


def recommend_materials(weakness_keywords: list[str], limit: int = 6) -> list[dict]:
    combined = " ".join(weakness_keywords).lower()
    scored = []
    for item in CATALOG:
        hits = [tag for tag in item["tags"] if tag in combined]
        score = len(hits)
        scored.append((score, item, hits))

    scored.sort(key=lambda t: t[0], reverse=True)

    out = []
    for score, item, hits in scored[:limit]:
        reason = f"Matches your recent focus on: {', '.join(hits)}" if hits else "General debate skill-building"
        out.append({**item, "id": item["title"].lower().replace(" ", "_"), "reason": reason})
    return out
