from sqlalchemy.orm import Session

from app.models.role import Role, RoleName

DEFAULT_ROLES = [
    (RoleName.LEARNER, "Practices debating, receives feedback and tracks skill growth."),
    (RoleName.DEBATE_COACH, "Guides learners, reviews sessions, assigns practice topics."),
    (RoleName.EDUCATOR, "Manages classes/cohorts, creates topics, monitors learner progress."),
    (RoleName.ADMINISTRATOR, "Manages users, roles and platform-wide configuration."),
]


def seed_roles(db: Session) -> None:
    for name, description in DEFAULT_ROLES:
        exists = db.query(Role).filter(Role.name == name.value).first()
        if not exists:
            db.add(Role(name=name.value, description=description))
    db.commit()
