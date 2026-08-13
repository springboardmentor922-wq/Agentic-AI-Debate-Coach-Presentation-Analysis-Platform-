from sqlalchemy.orm import Session

from app.models.presentation_domain import PresentationDomainOption

DEFAULT_DOMAINS = [
    ("Technical", "Engineering, software, and technical deep-dives"),
    ("Business", "Corporate strategy, operations, and management"),
    ("Education", "Teaching, curriculum, and academic contexts"),
    ("Marketing", "Branding, campaigns, and audience persuasion"),
    ("Healthcare", "Clinical, medical, and patient-facing communication"),
    ("Finance", "Investment, accounting, and financial analysis"),
    ("Sales", "Pitching, negotiation, and closing"),
    ("Human Resources", "People management, hiring, and culture"),
    ("Public Speaking", "General audience and stage presentation"),
    ("Interview Preparation", "Job interviews and professional Q&A"),
    ("Entrepreneurship", "Startup pitches and founder storytelling"),
    ("Research", "Academic and scientific presentation"),
    ("Legal", "Argumentation for legal and regulatory contexts"),
    ("Environmental", "Sustainability and climate-related topics"),
    ("Social Issues", "Advocacy and civic/social topics"),
]


def seed_presentation_domains(db: Session) -> None:
    for name, description in DEFAULT_DOMAINS:
        exists = db.query(PresentationDomainOption).filter(PresentationDomainOption.name == name).first()
        if not exists:
            db.add(PresentationDomainOption(name=name, description=description))
    db.commit()
