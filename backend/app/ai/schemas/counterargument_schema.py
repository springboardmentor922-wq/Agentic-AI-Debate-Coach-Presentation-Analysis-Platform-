from pydantic import BaseModel, Field


class CounterargumentResponse(BaseModel):
    summary: str = Field(
        description="Summary of the user's argument."
    )

    counterargument: str = Field(
        description="A strong opposing argument."
    )

    supporting_evidence: str = Field(
        description="Evidence supporting the counterargument."
    )

    challenge_question: str = Field(
        description="A question that encourages deeper reasoning."
    )