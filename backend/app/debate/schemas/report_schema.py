from typing import Any, List, Optional

from pydantic import BaseModel, Field


class DebateReport(BaseModel):
    """
    Represents a single debate analysis report stored in MongoDB.
    """

    report_id: str = Field(
        ...,
        description="MongoDB ObjectId of the report."
    )

    session_id: int = Field(
        ...,
        description="Debate session ID."
    )

    user_id: Optional[int] = Field(
        None,
        description="User ID."
    )

    topic_id: Optional[int] = Field(
        None,
        description="Debate topic ID."
    )

    input_type: str = Field(
        ...,
        description="Type of debate input."
    )

    media_filename: str = Field(
        ...,
        description="Uploaded media filename."
    )

    transcript: dict = Field(
        ...,
        description="Speech transcription."
    )

    argument_analysis: dict = Field(
        ...,
        description="Argument analysis results."
    )

    counterargument_analysis: dict = Field(
        ...,
        description="Counterargument analysis results."
    )

    logical_fallacy_analysis: dict = Field(
        ...,
        description="Logical fallacy analysis results."
    )


class DebateReportResponse(BaseModel):
    """
    Response model for a single report.
    """

    success: bool

    message: str

    data: DebateReport


class DebateReportListResponse(BaseModel):
    """
    Response model for multiple reports.
    """

    success: bool

    message: str

    data: List[DebateReport]