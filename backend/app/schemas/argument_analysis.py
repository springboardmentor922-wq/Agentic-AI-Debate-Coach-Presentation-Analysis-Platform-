from pydantic import BaseModel


class ArgumentAnalysis(BaseModel):
    main_claim: str
    supporting_evidence: str
    strengths: list[str]
    weaknesses: list[str]
    overall_analysis: str
    fallacies: str
    counterargument: str
    feedback: str
    opponent_response: str