from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship

from app.db.postgres import Base

user_presentation_domains = Table(
    "user_presentation_domains",
    Base.metadata,
    Column("profile_id", Integer, ForeignKey("user_profiles.id"), primary_key=True),
    Column("domain_id", Integer, ForeignKey("presentation_domain_options.id"), primary_key=True),
)


class PresentationDomainOption(Base):
    __tablename__ = "presentation_domain_options"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profiles = relationship("UserProfile", secondary=user_presentation_domains, back_populates="presentation_domains")