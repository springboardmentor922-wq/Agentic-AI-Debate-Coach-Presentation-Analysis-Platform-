from app.models.presentation_domain import PresentationDomainOption, user_presentation_domains  

DEFAULT_DOMAINS = [
    "Technical", "Business", "Education", "Marketing", "Healthcare", "Finance",
    "Sales", "Human Resources", "Public Speaking", "Interview Preparation",
    "Entrepreneurship", "Research", "Legal", "Environmental", "Social Issues",
]


def seed_presentation_domains(db):
    existing = {d.name for d in db.query(PresentationDomainOption).all()}
    for name in DEFAULT_DOMAINS:
        if name not in existing:
            db.add(PresentationDomainOption(name=name))
    db.commit()