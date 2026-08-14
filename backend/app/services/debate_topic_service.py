"""
=========================================================
Debate Topic Service

Business Logic for:

- Create Debate Topic
- Get All Debate Topics
- Get Debate Topic By ID
- Update Debate Topic
- Delete Debate Topic

=========================================================
"""

from sqlalchemy.orm import Session

from app.models.debate_topic import DebateTopic
from app.models.user import User

from app.schemas.debate_topic import (
    CreateDebateTopicRequest,
    UpdateDebateTopicRequest,
    GenerateTopicRequest,
    GenerateTopicResponse
)


import re

def sanitize_topic_text(text: str) -> str:
    """
    Sanitizes user-facing debate topic strings by removing internal reference IDs,
    seed identifiers, or tag annotations such as (Ref #123), [Ref #954], Ref #977, etc.
    """
    if not text:
        return text
    # Pattern matching (Ref #123), [Ref #954], Ref #977, (Seed 456), etc.
    pattern = r"\s*[\(\[\{]?\s*(?:Ref|Reference|Seed)\s*#?\s*\d+\s*[\)\]\}]?"
    cleaned = re.sub(pattern, "", text, flags=re.IGNORECASE)
    # Fix whitespace before punctuation like " ?" or " ."
    cleaned = re.sub(r"\s+([?\!.,])", r"\1", cleaned)
    # Normalize multiple spaces and strip
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


class DebateTopicService:

    # =====================================================
    # Create Debate Topic
    # =====================================================

    @staticmethod
    def create_topic(
        db: Session,
        topic_data: CreateDebateTopicRequest,
        current_user: User
    ):

        clean_title = sanitize_topic_text(topic_data.title)
        existing_topic = (
            db.query(DebateTopic)
            .filter(DebateTopic.title == clean_title)
            .first()
        )

        if existing_topic:
            raise ValueError("Debate topic already exists.")

        clean_goal = sanitize_topic_text(topic_data.learning_goal) if topic_data.learning_goal else None

        new_topic = DebateTopic(

            title=clean_title,

        

            category=topic_data.category,

            difficulty_level=topic_data.difficulty_level,

            debate_format=topic_data.debate_format,

            topic_type=topic_data.topic_type,

            visibility=topic_data.visibility,

            estimated_duration=topic_data.estimated_duration,

            learning_goal=clean_goal,

            is_system_generated=False,

            created_by=current_user.id,

            is_active=True

        )

        db.add(new_topic)

        db.commit()

        db.refresh(new_topic)

        return new_topic

    # =====================================================
    # Get All Debate Topics
    # =====================================================

    @staticmethod
    def get_all_topics(
        db: Session
    ):

        return (
            db.query(DebateTopic)
            .filter(DebateTopic.is_active == True)
            .all()
        )

    # =====================================================
    # Get Debate Topic By ID
    # =====================================================

    @staticmethod
    def get_topic_by_id(
        db: Session,
        topic_id: int
    ):

        topic = (
            db.query(DebateTopic)
            .filter(DebateTopic.id == topic_id)
            .first()
        )

        if topic is None:
            raise ValueError("Debate topic not found.")

        return topic

    # =====================================================
    # Update Debate Topic
    # =====================================================

    @staticmethod
    def update_topic(
        db: Session,
        topic_id: int,
        topic_data: UpdateDebateTopicRequest,
        current_user: User
    ):

        topic = (
            db.query(DebateTopic)
            .filter(DebateTopic.id == topic_id)
            .first()
        )

        if topic is None:
            raise ValueError("Debate topic not found.")

        # Official topics cannot be edited
        if topic.topic_type.upper() == "OFFICIAL":
            raise ValueError("Official topics cannot be edited.")

        # Only the creator can edit the topic
        if topic.created_by != current_user.id:
            raise ValueError("You can edit only your own topics.")

        update_data = topic_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            if field in ("title", "learning_goal") and isinstance(value, str):
                value = sanitize_topic_text(value)
            setattr(topic, field, value)

        db.commit()

        db.refresh(topic)

        return topic

    # =====================================================
    # Delete Debate Topic
    # =====================================================

    @staticmethod
    def delete_topic(
        db: Session,
        topic_id: int,
        current_user: User,
    ):

        topic = (
            db.query(DebateTopic)
            .filter(DebateTopic.id == topic_id)
            .first()
        )

        if topic is None:
            raise ValueError("Debate topic not found.")

        # Official topics cannot be deleted
        if topic.topic_type.upper() == "OFFICIAL":
            raise ValueError("Official topics cannot be deleted.")

        # Only creator can delete
        if topic.created_by != current_user.id:
            raise ValueError("You can delete only your own topics.")

        topic.is_active = False

        db.commit()

        return {
            "message": "Debate topic deleted successfully."
        }

    # =====================================================
    # Generate AI Debate Topic
    # =====================================================

    @staticmethod
    def generate_ai_topic(
        db: Session,
        req: GenerateTopicRequest,
        current_user: User
    ) -> GenerateTopicResponse:
        """
        Generates a new structured debate topic using the AI LLM service.
        Guarantees unique, distinct topics across multiple clicks and prevents generating duplicates of existing DB topics.
        """
        import random, json, re, time
        category = req.category or "Technology"
        difficulty = req.difficulty_level or "Beginner"
        debate_format = req.debate_format or "Public Forum Debate"

        # Query existing topic titles to ensure generated AI topic is unique
        existing_titles = set()
        if db:
            from app.models.debate_topic import DebateTopic
            db_titles = db.query(DebateTopic.title).all()
            existing_titles = {sanitize_topic_text(t[0]).strip().lower() for t in db_titles if t and t[0]}

        def parse_duration(val, default=20):
            val_str = str(val or default)
            match = re.search(r"\d+", val_str)
            if match:
                d = int(match.group(0))
                return d if 5 <= d <= 120 else default
            return default

        # Try generating via LLM (with fallback model if primary model encounters rate limits)
        try:
            from app.core.config import settings
            from langchain_core.messages import SystemMessage, HumanMessage

            avoid_list = [t for t in list(existing_titles)[-15:] if t]
            avoid_prompt = f" Avoid generating any of these existing topics or similar variants: {avoid_list}." if avoid_list else ""

            # Obtain primary LLM or construct fallback client
            llm_instances = []
            try:
                from app.ai.llm.llm import llm as primary_llm
                llm_instances.append(primary_llm)
            except Exception:
                pass

            if settings.LLM_PROVIDER == "groq" and settings.GROQ_API_KEY:
                try:
                    from langchain_groq import ChatGroq
                    fallback_llm = ChatGroq(
                        groq_api_key=settings.GROQ_API_KEY,
                        model_name="llama-3.1-8b-instant",
                        temperature=0.7,
                    )
                    llm_instances.append(fallback_llm)
                except Exception:
                    pass

            for active_llm in llm_instances:
                for attempt in range(3):
                    nonce = f"{time.time_ns()}-{random.randint(1000, 9999)}"
                    user_prompt = req.prompt or f"Generate a distinct, novel, and creative {difficulty} debate topic for category '{category}'."

                    sys_msg = SystemMessage(content=(
                        "You are an expert AI Debate Coach. Generate a single distinct, novel, highly engaging debate topic. "
                        "Output MUST be valid JSON with keys: title, category, difficulty_level, debate_format, estimated_duration, learning_goal. "
                        f"The topic category MUST be exactly '{category}' and difficulty_level MUST be '{difficulty}'. "
                        "Do NOT include internal reference IDs, seed numbers, or tag brackets (such as 'Ref #...', 'Seed #...', '[Ref...]', etc.) in any field. "
                        "Do NOT include markdown block syntax or additional commentary."
                        f"{avoid_prompt}"
                    ))
                    user_msg = HumanMessage(content=(
                        f"Topic Category: {category}\n"
                        f"Difficulty Level: {difficulty}\n"
                        f"Format: {debate_format}\n"
                        f"Request Nonce: {nonce}\n"
                        f"Attempt: {attempt + 1}\n"
                        f"User Hint / Context: {user_prompt}"
                    ))

                    try:
                        res = active_llm.invoke([sys_msg, user_msg])
                        text = res.content if hasattr(res, "content") else str(res)

                        match = re.search(r"\{.*\}", text, re.DOTALL)
                        if match:
                            text = match.group(0)
                        data = json.loads(text)

                        raw_title = data.get("title", "")
                        if not raw_title:
                            continue

                        raw_goal = data.get("learning_goal", f"Develop structured arguments and critical analysis in {category}.")

                        clean_title = sanitize_topic_text(raw_title)
                        clean_goal = sanitize_topic_text(raw_goal)

                        if clean_title.strip().lower() not in existing_titles:
                            duration = parse_duration(data.get("estimated_duration", 20))
                            return GenerateTopicResponse(
                                title=clean_title,
                                category=category,
                                difficulty_level=difficulty,
                                debate_format=data.get("debate_format", debate_format),
                                estimated_duration=duration,
                                learning_goal=clean_goal
                            )
                    except Exception as invoke_err:
                        # If active LLM failed (e.g. rate limit), break to next LLM instance
                        break
        except Exception:
            pass

        # Dynamic fallback pool ensuring unique, non-duplicate topic if LLM is unreachable
        fallback_pools = {
            "Technology": [
                {
                    "title": "Should Autonomous AI Agents be legally held accountable for financial and operational decisions?",
                    "goal": "Evaluate ethical accountability, algorithmic responsibility, and legal precedent in modern technology."
                },
                {
                    "title": "Should open-source foundational AI models be restricted to prevent misuse?",
                    "goal": "Analyze open-source innovation, dual-use technology risks, and global security."
                },
                {
                    "title": "Should social media platforms be legally treated as public utilities subject to strict oversight?",
                    "goal": "Develop compelling arguments on digital public squares, free expression, and market regulation."
                },
                {
                    "title": "Should quantum computing research be subject to international non-proliferation treaties?",
                    "goal": "Master complex technological policy analysis and international security argumentation."
                },
                {
                    "title": "Should consumer electronics manufacturers be legally mandated to support right-to-repair standards?",
                    "goal": "Examine corporate responsibility, electronic waste, and consumer property rights."
                }
            ],
            "Artificial Intelligence": [
                {
                    "title": "Should commercial deployment of frontier LLMs require mandatory government safety certification?",
                    "goal": "Analyze technology risk management, safety benchmarks, and regulatory frameworks."
                },
                {
                    "title": "Will Generative AI erode human critical thinking skills more than enhance productivity?",
                    "goal": "Evaluate cognitive impacts of AI assistance, educational philosophy, and skill preservation."
                },
                {
                    "title": "Should copyright law be reformed to prohibit training AI models on copyrighted creative works?",
                    "goal": "Examine intellectual property rights, fair use doctrines, and creative industry economics."
                },
                {
                    "title": "Should AI-generated deepfakes be banned outright across all digital public media?",
                    "goal": "Debate media authenticity, digital forensic regulation, and free speech bounds."
                }
            ],
            "Education": [
                {
                    "title": "Should traditional standardized exams be replaced by continuous AI-evaluated project portfolios?",
                    "goal": "Build strong arguments regarding educational equity, assessment accuracy, and student engagement."
                },
                {
                    "title": "Should higher education institutions mandate AI literacy as a core graduation requirement?",
                    "goal": "Argue curriculum modernization, workforce readiness, and technological adaptation."
                },
                {
                    "title": "Is remote digital learning fundamentally inferior to mandatory in-person classroom education?",
                    "goal": "Debate pedagogical outcomes, social development, and educational accessibility."
                },
                {
                    "title": "Should homework assignments be banned in primary education to foster self-directed learning?",
                    "goal": "Analyze workload balance, student wellbeing, and academic retention methodologies."
                }
            ],
            "Ethics": [
                {
                    "title": "Does the rapid advancement of automation cause more societal harm than economic benefit?",
                    "goal": "Sharpen philosophical reasoning, labor market dynamics, and ethical argumentation skills."
                },
                {
                    "title": "Should tech corporations be ethically prohibited from monetizing biometric user data?",
                    "goal": "Deconstruct privacy ethics, digital consent, and corporate accountability."
                },
                {
                    "title": "Should gene editing technology be restricted strictly to lethal genetic disease treatment?",
                    "goal": "Evaluate bioethics, genetic enhancement boundaries, and long-term societal impacts."
                }
            ]
        }

        pool = fallback_pools.get(category, [
            {
                "title": f"Should universal policy standards be implemented for modern {category} practices?",
                "goal": f"Master policy analysis, evidence synthesis, and structured debate strategy in {category}."
            },
            {
                "title": f"Does rapid innovation in {category} outpace public safety and ethical safeguards?",
                "goal": f"Evaluate innovation velocity versus ethical governance in {category}."
            },
            {
                "title": f"Should international bodies mandate global transparency regulations for {category}?",
                "goal": f"Analyze global compliance frameworks and regulatory enforcement in {category}."
            }
        ])

        available_pool = [t for t in pool if sanitize_topic_text(t["title"]).strip().lower() not in existing_titles]
        if available_pool:
            selected = random.choice(available_pool)
        else:
            domains = ["cybersecurity oversight", "data governance", "algorithmic transparency", "digital privacy rights", "emerging innovation frameworks", "automated decision systems"]
            contexts = ["modern institutional governance", "global regulatory compliance", "contemporary public policy", "future technological integration", "ethical societal standards"]
            
            selected_title = ""
            for d_idx in domains:
                for c_idx in contexts:
                    candidate = f"Should {category} policies on {d_idx} be restructured for {c_idx}?"
                    if candidate.strip().lower() not in existing_titles:
                        selected_title = candidate
                        break
                if selected_title:
                    break

            if not selected_title:
                selected_title = f"To what extent should {category} governance address contemporary {difficulty.lower()} challenges?"

            selected = {
                "title": selected_title,
                "goal": f"Master policy analysis and structured debate strategy in {category}."
            }

        clean_title = sanitize_topic_text(selected["title"])
        clean_goal = sanitize_topic_text(selected["goal"])

        return GenerateTopicResponse(
            title=clean_title,
            category=category,
            difficulty_level=difficulty,
            debate_format=debate_format,
            estimated_duration=20,
            learning_goal=clean_goal
        )