import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.postgres import Base


class SessionStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    PENDING = "pending"        
    CONFIRMED = "confirmed"    
    DECLINED = "declined"   

class DebateFormat(str, enum.Enum):
    ONE_ON_ONE = "one_on_one"
    PUBLIC_FORUM = "public_forum"
    PARLIAMENTARY = "parliamentary"
    OXFORD = "oxford"
    POLICY = "policy"

class SessionStance(str, enum.Enum):
    FOR = "for"
    AGAINST = "against"
    NOT_SET = "not_set"

class OpponentType(str, enum.Enum):
    AI = "ai"
    HUMAN = "human"
    COACH_DEBATE = "coach_debate"
    COACH_ADJUDICATE = "coach_adjudicate"

class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("debate_topics.id"), nullable=True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # assigned debate coach, optional
    
    scheduled_by = Column(Integer, ForeignKey("users.id"), nullable=True)   
    invitee_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    stance = Column(Enum(SessionStance), default=SessionStance.NOT_SET)
    debate_format = Column(Enum(DebateFormat), default=DebateFormat.ONE_ON_ONE)
    opponent_type = Column(Enum(OpponentType), default=OpponentType.AI)
    opponent_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(SessionStatus), default=SessionStatus.SCHEDULED)
    duration_minutes = Column(Integer, default=10)

    scheduled_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="debate_sessions", foreign_keys=[user_id])
    coach = relationship("User", foreign_keys=[coach_id])
    topic = relationship("DebateTopic", back_populates="sessions")

    max_turns = Column(Integer, default=6)
    overall_score = Column(Float, nullable=True) 
    winner = Column(String(20), nullable=True)  
    debate_performance_score = Column(Float, nullable=True)  # session avg, 0-100
    critical_thinking_score = Column(Float, nullable=True)    # session avg, 0-100

  