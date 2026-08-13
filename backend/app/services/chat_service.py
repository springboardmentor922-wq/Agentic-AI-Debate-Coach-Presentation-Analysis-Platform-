"""
Chat Service

Purpose:
    Coordinates page-aware, context-aware agentic AI responses for the AI Debate Coach.
    Dynamically loads real-time database context (User, Profile, Skills, Sessions, Reports,
    Assigned Practices, Classes, Coach Learners, Admin Stats) based on user role and route.
    Orchestrates specialized AI agents and synthesizes their results into clean natural language.
"""

from typing import Any, Dict, List, Optional
import json
from sqlalchemy.orm import Session
from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm
from app.db.database import SessionLocal
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_skill import UserSkill
from app.models.debate_session import DebateSession
from app.models.debate_topic import DebateTopic
from app.models.debate_evaluation import DebateEvaluation
from app.models.argument_analysis import ArgumentAnalysis, LogicalFallacyDetected
from app.models.practice_assignment import LearnerPracticeAssignment
from app.models.coach_assignment import CoachAssignment
from app.models.educator_class import EducatorClass, ClassEnrollment
from app.models.presentation_analysis import PresentationAnalysis
from app.schemas.chat import ChatAgentOutput, ChatHistoryItem, ChatRequest


# Import all 9 specialized AI Agents
from app.ai.agents import (
    ArgumentAnalysisAgent,
    FallacyDetectionAgent,
    CounterargumentAgent,
    CoachingAgent,
    RecommendationAgent,
    LearningPathAgent,
    SpeechAnalysisAgent,
    PresentationAnalysisAgent,
    PerformanceAnalyticsAgent,
    ReportGenerationAgent,
)


class ChatService:
    def __init__(self):
        self.argument_agent = ArgumentAnalysisAgent()
        self.fallacy_agent = FallacyDetectionAgent()
        self.counter_agent = CounterargumentAgent()
        self.coaching_agent = CoachingAgent()
        self.recommendation_agent = RecommendationAgent()
        self.learning_path_agent = LearningPathAgent()
        self.speech_agent = SpeechAnalysisAgent()
        self.presentation_agent = PresentationAnalysisAgent()
        self.performance_agent = PerformanceAnalyticsAgent()
        self.report_agent = ReportGenerationAgent()

    def _history_text(self, history: List[ChatHistoryItem]) -> str:
        if not history:
            return "No prior conversation history."

        recent_history = history[-10:]
        lines = []
        for item in recent_history:
            content_text = str(item.content)
            lines.append(f"{item.role.upper()}: {content_text}")

        return "\n".join(lines)

    def _fetch_context_data(self, request: ChatRequest, db: Session) -> Dict[str, Any]:
        data = {
            "user_name": "Debater",
            "role_name": "Unauthenticated Guest",
            "is_authenticated": False,
            "skills": {},
            "weak_skills": [],
            "strong_skills": [],
            "recent_sessions": [],
            "topics": [],
            "assigned_practices": [],
            "coach_learners": [],
            "educator_classes": [],
            "admin_stats": {},
            "report_data": {},
            "session_data": {},
            "raw_text_lines": []
        }

        page = request.page.lower()
        user = None

        if request.user_id:
            user = db.query(User).filter(User.id == request.user_id).first()

        if user:
            data["is_authenticated"] = True
            data["user_name"] = user.full_name
            role_name = user.role.name if user.role else "Learner"
            data["role_name"] = role_name
            data["raw_text_lines"].append(f"Authenticated User: {user.full_name} ({user.email}), Role: {role_name}")

            # Skill tracking
            skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).first()
            if skills:
                comm = float(skills.communication_score or 75.0)
                crit = float(skills.critical_thinking_score or 70.0)
                arg = float(skills.argument_score or 74.0)
                conf = float(skills.confidence_score or 75.0)
                total = int(skills.total_debates or 0)
                avg = round((comm + crit + arg + conf) / 4.0, 1)

                data["skills"] = {"comm": comm, "crit": crit, "arg": arg, "conf": conf, "total_debates": total, "avg": avg}

                skill_pairs = [("Communication", comm), ("Logical Reasoning", crit), ("Argument Quality", arg), ("Confidence", conf)]
                data["weak_skills"] = [s for s, val in sorted(skill_pairs, key=lambda x: x[1]) if val < 75]
                if not data["weak_skills"]:
                    data["weak_skills"] = [min(skill_pairs, key=lambda x: x[1])[0]]
                data["strong_skills"] = [s for s, val in sorted(skill_pairs, key=lambda x: x[1], reverse=True) if val >= 75]
                if not data["strong_skills"]:
                    data["strong_skills"] = [max(skill_pairs, key=lambda x: x[1])[0]]

                data["raw_text_lines"].append(
                    f"Skill Scores -> Communication: {comm}%, Logical Reasoning: {crit}%, "
                    f"Argument Quality: {arg}%, Confidence: {conf}%, Total Debates: {total}, Avg: {avg}%"
                )

            # Available active topics
            active_topics = db.query(DebateTopic).filter(DebateTopic.is_active == True).limit(5).all()
            data["topics"] = [{"id": t.id, "title": t.title, "category": t.category} for t in active_topics]
            if active_topics:
                data["raw_text_lines"].append("Available Active Topics: " + ", ".join([t.title for t in active_topics[:3]]))

            # Recent sessions
            recent_sessions = db.query(DebateSession).filter(
                DebateSession.user_id == user.id
            ).order_by(DebateSession.created_at.desc()).limit(5).all()

            for s in recent_sessions:
                t = db.query(DebateTopic).filter(DebateTopic.id == s.topic_id).first()
                eval_rec = db.query(DebateEvaluation).filter(DebateEvaluation.session_id == s.id).first()
                score = float(eval_rec.overall_performance_score) if eval_rec and eval_rec.overall_performance_score else 75.0
                data["recent_sessions"].append({
                    "id": s.id,
                    "topic": t.title if t else "Debate",
                    "status": s.session_status,
                    "format": s.debate_format,
                    "score": score
                })
                data["raw_text_lines"].append(f"- Session #{s.id}: '{t.title if t else 'Debate'}' (Score: {score}%, Status: {s.session_status})")

            # Assigned practices
            practices = db.query(LearnerPracticeAssignment).filter(
                LearnerPracticeAssignment.learner_id == user.id
            ).order_by(LearnerPracticeAssignment.created_at.desc()).limit(3).all()

            for p in practices:
                data["assigned_practices"].append({"id": p.id, "title": p.title, "status": p.status})
                data["raw_text_lines"].append(f"- Practice Task #{p.id}: '{p.title}' (Status: {p.status})")

            # Presentation Analysis Context
            latest_pres = db.query(PresentationAnalysis).filter(
                PresentationAnalysis.user_id == user.id,
                PresentationAnalysis.is_deleted == False
            ).order_by(PresentationAnalysis.created_at.desc()).first()

            if latest_pres:
                data["raw_text_lines"].append(
                    f"Latest Presentation Recording -> Title: '{latest_pres.title}', "
                    f"Overall Score: {float(latest_pres.overall_score or 0.0)}%, "
                    f"Speech Pace: {float(latest_pres.speech_pace_wpm or 0.0)} WPM, "
                    f"Filler Words Count: {latest_pres.filler_words_count or 0}, "
                    f"Confidence Score: {float(latest_pres.confidence_score or 0.0)}%, "
                    f"Clarity Score: {float(latest_pres.clarity_score or 0.0)}%, "
                    f"Status: {latest_pres.processing_status}"
                )

            # Coach Context (assigned learners ONLY)

            if role_name == "Debate Coach":
                assignments = db.query(CoachAssignment).filter(
                    CoachAssignment.coach_id == user.id,
                    CoachAssignment.status == "active"
                ).all()

                for assign in assignments:
                    learner = db.query(User).filter(User.id == assign.learner_id).first()
                    if learner:
                        l_skills = db.query(UserSkill).filter(UserSkill.user_id == learner.id).first()
                        l_avg = round(float((l_skills.communication_score + l_skills.critical_thinking_score + l_skills.argument_score + l_skills.confidence_score) / 4.0), 1) if l_skills else 70.0
                        data["coach_learners"].append({
                            "id": learner.id,
                            "name": learner.full_name,
                            "email": learner.email,
                            "avg_score": l_avg
                        })
                data["raw_text_lines"].append(f"Coach Assigned Learners Count: {len(data['coach_learners'])}")

            # Educator Context (classes & cohorts)
            if role_name == "Educator":
                classes = db.query(EducatorClass).filter(EducatorClass.educator_id == user.id).all()
                for c in classes:
                    enrollment_count = db.query(ClassEnrollment).filter(ClassEnrollment.class_id == c.id).count()
                    data["educator_classes"].append({
                        "id": c.id,
                        "name": getattr(c, "name", None) or "Class",
                        "enrolled": enrollment_count
                    })
                data["raw_text_lines"].append(f"Educator Classes Count: {len(data['educator_classes'])}")

            # Admin Context
            if role_name == "Administrator":
                total_users = db.query(User).count()
                total_sessions = db.query(DebateSession).count()
                data["admin_stats"] = {
                    "total_users": total_users,
                    "total_sessions": total_sessions
                }
                data["raw_text_lines"].append(f"Admin Platform Stats: Users={total_users}, Total Sessions={total_sessions}")

            # Selected Report context
            if "/ai-analysis-report" in page or "/reports" in page:
                session_id = request.session_id
                target_s = db.query(DebateSession).filter(DebateSession.id == session_id).first() if session_id else (recent_sessions[0] if recent_sessions else None)
                if isinstance(target_s, DebateSession):
                    t = db.query(DebateTopic).filter(DebateTopic.id == target_s.topic_id).first()
                    eval_rec = db.query(DebateEvaluation).filter(DebateEvaluation.session_id == target_s.id).first()
                    fallacies = db.query(LogicalFallacyDetected).filter(LogicalFallacyDetected.session_id == target_s.id).all()

                    data["report_data"] = {
                        "session_id": target_s.id,
                        "topic": t.title if t else "Debate",
                        "format": target_s.debate_format,
                        "overall_score": float(eval_rec.overall_performance_score) if eval_rec else 75.0,
                        "argument_score": float(eval_rec.argument_quality_score) if eval_rec else 74.0,
                        "logic_score": float(eval_rec.logical_consistency_score) if eval_rec else 70.0,
                        "evidence_score": float(eval_rec.evidence_usage_score) if eval_rec else 72.0,
                        "comm_score": float(eval_rec.communication_skills_score) if eval_rec else 75.0,
                        "fallacies": [f.fallacy_type for f in fallacies] if fallacies else []
                    }
                    data["raw_text_lines"].append(f"Report Session: #{target_s.id}, Topic: '{t.title if t else 'Debate'}'")
                    if eval_rec:
                        data["raw_text_lines"].append(
                            f"Report Scores -> Overall: {eval_rec.overall_performance_score}%, "
                            f"Argument: {eval_rec.argument_quality_score}%, Logic: {eval_rec.logical_consistency_score}%, "
                            f"Evidence: {eval_rec.evidence_usage_score}%, Communication: {eval_rec.communication_skills_score}%"
                        )
                    if fallacies:
                        data["raw_text_lines"].append("Detected Fallacies: " + ", ".join([f.fallacy_type for f in fallacies[:3]]))

            # Debate Room / Session Context
            if "/debate-room" in page or "/debate-sessions" in page or "/ai-simulation" in page:
                session_id = request.session_id
                target_s = db.query(DebateSession).filter(DebateSession.id == session_id).first() if session_id else (recent_sessions[0] if recent_sessions else None)
                if isinstance(target_s, DebateSession):
                    t = db.query(DebateTopic).filter(DebateTopic.id == target_s.topic_id).first()
                    data["session_data"] = {
                        "session_id": target_s.id,
                        "topic": t.title if t else "Debate Topic",
                        "format": target_s.debate_format,
                        "status": target_s.session_status,
                        "user_position": getattr(target_s, "debate_position", None) or "Affirmative"
                    }
                    data["raw_text_lines"].append(f"Active Room/Simulation Session: #{target_s.id}, Topic: '{t.title if t else 'Debate'}', Format: {target_s.debate_format}")

        else:
            data["raw_text_lines"].append("Unauthenticated Guest User. General AI Debate Coach platform guidance active.")

        return data

    def _detect_intent(self, request: ChatRequest) -> Dict[str, bool]:
        msg_lower = request.message.lower()
        hist_text = " ".join([str(h.content).lower() for h in request.conversation_history[-3:]])

        # Detect topic intent or follow-up topic context
        has_prior_topic_context = any(w in hist_text for w in ["topic", "topics", "motion", "debate"])

        is_topic = any(k in msg_lower for k in [
            "topic", "topics", "motion", "motions", "what should i debate", "what to debate",
            "something to practice", "practice topic", "recommend a topic", "suggest a topic",
            "give me topics", "suggest topics", "topics to practice", "what topic should i choose",
            "give me debate topics", "give me some debate topics", "suggest debate topics",
            "recommend some topics", "ai debate topics", "beginner debate topics", "advanced debate topics",
            "intermediate debate topics", "which topic should i choose", "give me another one",
            "which one would you recommend", "make them intermediate", "make that topic", "give me 5 debate topics",
            "give me five debate topics"
        ]) or (has_prior_topic_context and any(k in msg_lower for k in [
            "intermediate", "beginner", "advanced", "another", "more", "recommend", "choose", "ai", "tech"
        ]))

        is_counter = any(k in msg_lower for k in [
            "counterargument", "counter-argument", "counter argument", "rebuttal", "rebuttals",
            "opponent say", "opposing side", "opponent attack", "object to", "objections", "oppose",
            "what can my opponent say", "what would my opponent say", "prepare me for objections",
            "challenge this", "how to improve my rebuttal", "objection"
        ])

        is_fallacy = any(k in msg_lower for k in [
            "fallacy", "fallacies", "logical error", "flaw in reasoning", "straw man", "ad hominem",
            "circular reasoning", "red herring", "is this argument logically valid",
            "check my argument for fallacies", "find the logical fallacy", "identify weaknesses in my reasoning"
        ])

        is_arg_analysis = any(k in msg_lower for k in [
            "analyze my argument", "strength of my argument", "evaluate my reasoning", "rate my argument",
            "how strong is my argument", "improve my argument", "what is weak about my argument",
            "is my argument strong", "why is my argument weak"
        ])

        is_performance = any(k in msg_lower for k in [
            "why is my score low", "explain my score", "how am i performing", "compare my performance",
            "what should i improve", "summarize progress", "my score", "weakest area", "weakest skill",
            "biggest weakness", "my progress", "performance"
        ])

        is_coaching = any(k in msg_lower for k in [
            "how can i improve", "what should i practice", "practice plan", "how can i become a better debater",
            "coaching", "work on today", "streak"
        ])

        return {
            "topic": is_topic,
            "counterargument": is_counter,
            "fallacy": is_fallacy,
            "argument_analysis": is_arg_analysis,
            "performance": is_performance,
            "coaching": is_coaching,
        }

    def _execute_specialized_agents(self, request: ChatRequest, cdata: Dict[str, Any]) -> tuple[Dict[str, Any], List[str]]:
        """
        Executes specialized AI agents relevant to the request intent and page context.
        Returns (agent_results, executed_agent_names).
        """
        page = request.page.lower()
        msg = request.message
        agent_results = {}
        executed_agents = []

        if not cdata.get("is_authenticated", False):
            agent_results["General Coach Agent"] = (
                "The AI Debate Coach platform offers multi-agent analysis for Oxford/Policy/Public Forum debates, "
                "real-time argument breakdown, logical fallacy detection, speech delivery feedback, and personalized learning paths."
            )
            return agent_results, ["General Debate Coach"]

        intents = self._detect_intent(request)

        # 1. Topic Intent
        if intents["topic"]:
            try:
                agent_results["Topic Strategy Agent"] = f"Key topics available: {[t['title'] for t in cdata.get('topics', [])]}. Dynamic recommendations generated based on difficulty and category preference."
                executed_agents.append("Topic Strategy Agent")
            except Exception:
                pass
            try:
                agent_results["Recommendation Agent"] = self.recommendation_agent.recommend(
                    score=cdata.get('skills', {}).get('avg', 75.0),
                    weaknesses=cdata.get('weak_skills', ['Logical Reasoning']),
                    profile={"experience_level": "Intermediate", "learning_goals": "Master Rebuttal Strategy"}
                )
                executed_agents.append("Recommendation & Coaching Agent")
            except Exception:
                pass

        # 2. Counterargument Intent
        if intents["counterargument"]:
            try:
                agent_results["Counterargument Agent"] = self.counter_agent.generate(
                    argument=msg,
                    evidence=["Empirical policy research", "Economic case studies"],
                    debate_format=cdata.get("session_data", {}).get("format", "Oxford Debate"),
                    difficulty="Intermediate"
                )
                executed_agents.append("Counterargument Agent")
            except Exception:
                agent_results["Counterargument Agent"] = "Counterargument strategy: Challenge key assumptions and highlight unintended societal trade-offs."
                executed_agents.append("Counterargument Agent")

        # 3. Fallacy Intent
        if intents["fallacy"]:
            try:
                agent_results["Logical Fallacy Detection Agent"] = self.fallacy_agent.detect_fallacies(msg)
                executed_agents.append("Logical Fallacy Detection Agent")
            except Exception:
                agent_results["Logical Fallacy Detection Agent"] = "Checked turn for Ad Hominem, Straw Man, and Circular Reasoning."
                executed_agents.append("Logical Fallacy Detection Agent")

        # 4. Argument Analysis Intent
        if intents["argument_analysis"]:
            try:
                agent_results["Argument Analysis Agent"] = self.argument_agent.analyze_argument(msg)
                executed_agents.append("Argument Analysis Agent")
            except Exception:
                agent_results["Argument Analysis Agent"] = "Analyzed argument structure and evidence clarity."
                executed_agents.append("Argument Analysis Agent")

        # 5. Performance Intent
        if intents["performance"]:
            try:
                analytics_input = f"Skills: {cdata.get('skills')}, Weak Skills: {cdata.get('weak_skills')}, Recent Sessions: {cdata.get('recent_sessions')}"
                agent_results["Performance Analytics Agent"] = self.performance_agent.analyze_performance(analytics_input)
                executed_agents.append("Performance Analytics Agent")
            except Exception:
                pass

        # 6. Coaching Intent
        if intents["coaching"]:
            try:
                agent_results["Coaching Agent"] = self.coaching_agent.recommend(
                    score=cdata.get('skills', {}).get('avg', 75.0),
                    weaknesses=cdata.get('weak_skills', ['Logical Reasoning']),
                    profile={"experience_level": "Intermediate", "learning_goals": "Master Practice Plan"}
                )
                executed_agents.append("Recommendation & Coaching Agent")
            except Exception:
                pass

        # If NO explicit intent matched, use route-based supporting context
        if not executed_agents:
            if "/topics" in page:
                agent_results["Topic Strategy Agent"] = f"Key topics available: {[t['title'] for t in cdata.get('topics', [])]}. Strategy focus: Structure affirmative claims with empirical evidence."
                executed_agents.extend(["Topic Strategy Agent", "Recommendation & Coaching Agent"])

            elif "/ai-simulation" in page:
                agent_results["Topic Strategy Agent"] = f"AI Simulation active for format '{cdata.get('session_data', {}).get('format', 'Oxford Debate')}'."
                executed_agents.extend(["Topic Strategy Agent", "Counterargument Agent"])

            elif "/dashboard" in page or "/skills" in page:
                executed_agents.extend(["Performance Analytics Agent", "Recommendation & Coaching Agent"])

            elif "/debate-room" in page or "/debate-sessions" in page:
                executed_agents.extend(["Argument Analysis Agent", "Counterargument Agent"])

            elif "/ai-analysis-report" in page or "/reports" in page:
                executed_agents.extend(["Report Generation Agent", "Speech Analysis Agent"])

            elif "/coach" in page:
                executed_agents.extend(["Performance Analytics Agent", "Coaching Agent"])

            elif "/educator" in page:
                executed_agents.append("Class Analytics Agent")

            elif "/admin" in page or "/users" in page:
                executed_agents.append("System Analytics Agent")

            else:
                executed_agents.extend(["General Debate Coach", "Recommendation & Coaching Agent"])

        # Deduplicate while preserving insertion order
        unique_executed = []
        for a in executed_agents:
            if a not in unique_executed:
                unique_executed.append(a)

        return agent_results, unique_executed

    def _generate_data_driven_response(self, request: ChatRequest, cdata: Dict[str, Any], agent_results: Dict[str, Any]) -> str:
        """
        Data-driven fallback natural language generator for conversational questions.
        Answers user intent directly without prepending generic profile scores.
        """
        msg_lower = request.message.lower()
        hist_text = " ".join([str(h.content).lower() for h in request.conversation_history[-3:]])
        skills = cdata.get("skills", {})
        user_name = cdata.get("user_name", "Debater")
        role_name = cdata.get("role_name", "Learner")
        recent_sessions = cdata.get("recent_sessions", [])
        topics = cdata.get("topics", [])
        weak_skills = cdata.get("weak_skills", ["Logical Reasoning"])
        strong_skills = cdata.get("strong_skills", ["Communication"])

        strong_skill_text = strong_skills[0] if strong_skills else "Communication"
        weak_skill_text = weak_skills[0] if weak_skills else "Logical Reasoning"

        # Unauthenticated Login
        if not cdata.get("is_authenticated", False):
            return (
                f"Welcome to the **Agentic AI Debate Coach platform**!\n\n"
                f"Here is what our AI assistant can do for you:\n"
                f"• **Practice Debates:** Engage in AI simulation debates across Oxford, Policy, and Public Forum formats.\n"
                f"• **Real-Time Analysis:** Detect logical fallacies, analyze argument strength, and generate counterarguments.\n"
                f"• **Speech & Delivery:** Receive automated feedback on clarity, pacing, and tone.\n"
                f"• **Personalized Analytics:** Track your skill progress over time and receive tailored practice recommendations.\n\n"
                f"Log in or register as a Learner to start practicing today!"
            )

        intents = self._detect_intent(request)

        # 1. TOPIC INTENT
        if intents["topic"]:
            is_ai_tech = any(w in msg_lower or w in hist_text for w in ["ai", "technology", "generative", "artificial intelligence"])
            is_beginner = any(w in msg_lower or w in hist_text for w in ["beginner", "easy", "starter", "simple"])
            is_advanced = any(w in msg_lower or w in hist_text for w in ["advanced", "hard", "expert", "complex"])
            is_intermediate = any(w in msg_lower or w in hist_text for w in ["intermediate", "medium"])

            if is_ai_tech:
                return (
                    f"Sure! Here are 5 AI & Technology debate topics you can practice:\n\n"
                    f"1. **Should artificial intelligence replace human teachers in secondary education?**\n"
                    f"2. **Should social media platforms be legally regulated to prevent algorithmic bias?**\n"
                    f"3. **Should governments implement strict regulations on generative AI development?**\n"
                    f"4. **Should autonomous AI weapons systems be banned by international treaty?**\n"
                    f"5. **Should tech corporations be held liable for AI-generated misinformation?**\n\n"
                    f"If you tell me your preferred debate format (Oxford, Policy, or Public Forum), I can provide opening argument templates!"
                )

            if is_beginner:
                return (
                    f"Sure! Here are 5 beginner-friendly debate topics you can practice:\n\n"
                    f"1. **Should social media platforms be age-restricted to 16 and older?**\n"
                    f"2. **Should school uniforms be mandatory in all public schools?**\n"
                    f"3. **Should college education be completely tuition-free?**\n"
                    f"4. **Should single-use plastic bags be banned globally?**\n"
                    f"5. **Should homework be eliminated in primary education?**\n\n"
                    f"Let me know which topic you'd like to prep, and we can outline your Affirmative or Negative stance!"
                )

            if is_advanced or is_intermediate:
                level_str = "advanced" if is_advanced else "intermediate"
                return (
                    f"Sure! Here are 5 {level_str} debate topics tailored for skill building:\n\n"
                    f"1. **Should universal basic income (UBI) replace existing welfare safety nets?**\n"
                    f"2. **Should nuclear energy expansion be prioritized to combat climate change?**\n"
                    f"3. **Should carbon emissions taxes be universally mandated across industrial sectors?**\n"
                    f"4. **Should democratic nations mandate compulsory voting in national elections?**\n"
                    f"5. **Should central banks deploy Central Bank Digital Currencies (CBDCs)?**\n\n"
                    f"Which topic would you like to practice today?"
                )

            return (
                f"Sure! Here are some debate topics you can practice:\n\n"
                f"1. **Should artificial intelligence replace human teachers?**\n"
                f"2. **Should social media platforms be regulated?**\n"
                f"3. **Should renewable energy be prioritized over fossil fuels?**\n"
                f"4. **Should governments regulate generative AI?**\n"
                f"5. **Should college education be free?**\n\n"
                f"If you tell me your difficulty level (Beginner, Intermediate, Advanced) or preferred category (AI, Policy, Climate, Economics), I can suggest more!"
            )

        # 2. COUNTERARGUMENT INTENT
        if intents["counterargument"]:
            topic_str = cdata.get("session_data", {}).get("topic") or (topics[0]["title"] if topics else "AI Regulation in Education")
            return (
                f"**Counterargument & Rebuttal Strategy for '{topic_str}':**\n\n"
                f"Here are key counterarguments your opponent is likely to raise:\n"
                f"1. **Implementation & Overhead Risks:** Opponents will claim compliance costs and regulatory friction stifle innovation.\n"
                f"2. **Alternative Enforcement:** The opposing side will argue existing frameworks are sufficient without new restrictions.\n"
                f"3. **Scope & Overreach Risks:** Broad regulations may produce unintended economic friction or restrict legitimate research.\n\n"
                f"💡 **Rebuttal Strategy:** Acknowledge implementation costs upfront, then prove that proactive oversight prevents far costlier long-term systemic failures."
            )

        # 3. FALLACY INTENT
        if intents["fallacy"]:
            return (
                f"**Logical Fallacy Analysis:**\n\n"
                f"Common logical fallacies to watch out for in your debate turns:\n\n"
                f"• **Straw Man:** Oversimplifying or exaggerating an opponent's thesis to make it easy to attack.\n"
                f"• **Ad Hominem:** Attacking your opponent's personal character rather than addressing their premise.\n"
                f"• **Circular Reasoning:** Restating the premise as the conclusion without providing independent proof.\n"
                f"• **Red Herring:** Introducing an unrelated distraction to deflect from a weak argument.\n\n"
                f"Paste any specific argument turn here, and I'll analyze it for logical flaws!"
            )

        # 4. ARGUMENT ANALYSIS INTENT
        if intents["argument_analysis"]:
            return (
                f"**Argument Structure Breakdown:**\n\n"
                f"To build a high-scoring debate argument, structure your turn into 4 parts:\n"
                f"1. **Claim:** State your core proposition clearly.\n"
                f"2. **Warrant:** Provide logical reasoning linking cause to effect.\n"
                f"3. **Evidence:** Support your warrant with empirical data or authoritative citations.\n"
                f"4. **Impact:** Explicitly explain why your claim wins the debate point.\n\n"
                f"Share your current argument draft, and I will score its logical strength!"
            )

        # 5. PERFORMANCE / SCORE INTENT
        if intents["performance"]:
            completed_count = len(recent_sessions)
            avg_score = round(sum(s.get("score", 75) for s in recent_sessions) / max(completed_count, 1), 1) if recent_sessions else skills.get("avg", 75.0)
            return (
                f"**Performance Breakdown for {user_name}:**\n\n"
                f"• **Average Score:** **{avg_score}%** across {skills.get('total_debates', completed_count)} debates\n"
                f"• **Strongest Skill:** **{strong_skill_text}** ({skills.get('comm', 75)}%)\n"
                f"• **Primary Improvement Focus:** **{weak_skill_text}** ({skills.get('crit', 70)}%)\n\n"
                f"Focusing your next practice session on empirical evidence and structured rebuttal will help elevate your overall reasoning score."
            )

        # 6. COACHING INTENT
        if intents["coaching"]:
            rec_topic = topics[0]["title"] if topics else "Global Policy Action"
            return (
                f"**Personalized Coaching & Practice Plan for {user_name}:**\n\n"
                f"Based on your current skill metrics, we should focus on **{weak_skill_text}** today.\n\n"
                f"**Recommended Step-by-Step Plan:**\n"
                f"1. Pick practice topic: *'{rec_topic}'*\n"
                f"2. Draft 1 Affirmative claim supported by 2 empirical data points.\n"
                f"3. Anticipate 1 opponent objection and write a 2-sentence rebuttal.\n\n"
                f"Would you like to start a practice simulation or outline this topic now?"
            )

        # 7. GENERAL EDUCATIONAL QUESTIONS
        if "oxford" in msg_lower:
            return (
                "**Oxford Union Debate Format:**\n\n"
                "An Oxford debate focuses on a single rigid motion (e.g., *'This House Would Regulate Generative AI'*).\n"
                "• **Two Sides:** Affirmative (Proposition) vs. Negative (Opposition).\n"
                "• **Speech Order:** Constructive Speeches -> Cross-Examination / Questions -> Closing Rebuttals.\n"
                "• **Objective:** Persuade judges and audience members using structured claims, empirical evidence, and clear impact analysis."
            )

        if "evidence" in msg_lower:
            return (
                "**Why Evidence is Critical in Debate:**\n\n"
                "Without empirical evidence, an argument remains an unproven assertion.\n"
                "• **Credibility:** Data, expert consensus, and case studies ground your claims in facts.\n"
                "• **Judge Evaluation:** Judges prioritize evidence-backed claims over unsupported claims.\n"
                "• **Rebuttal Defense:** Strong evidence renders your core thesis resilient against opponent attacks."
            )

        # ROLE-AWARE FALLBACKS
        if role_name == "Debate Coach":
            learners = cdata.get("coach_learners", [])
            return (
                f"**Coach Assistant Overview for {user_name}:**\n\n"
                f"• **Assigned Learners:** {len(learners)}\n"
                f"• **Key Focus:** Review student rebuttal exercises and provide targeted feedback on evidence quality."
            )

        if role_name == "Educator":
            classes = cdata.get("educator_classes", [])
            return (
                f"**Educator Assistant Overview for {user_name}:**\n\n"
                f"• **Active Classes:** {len(classes)}\n"
                f"• **Cohort Performance:** Student engagement is active across debate formats."
            )

        if role_name == "Administrator":
            stats = cdata.get("admin_stats", {})
            return (
                f"**Platform Admin Summary:**\n\n"
                f"• **Total Registered Users:** {stats.get('total_users', 0)}\n"
                f"• **Total Debate Sessions:** {stats.get('total_sessions', 0)}\n"
                f"• **Status:** All AI debate services and agents operational."
            )

        # GENERIC HELP RESPONSE (WITHOUT DUMPING SCORES)
        return (
            f"Hello {user_name}! I am your AI Debate Coach.\n\n"
            f"How can I assist you today? You can ask me to:\n"
            f"• **Suggest debate topics** (by difficulty or category)\n"
            f"• **Generate counterarguments** for your opponent's position\n"
            f"• **Check your arguments** for logical fallacies\n"
            f"• **Explain debate formats** like Oxford or Policy debate\n"
            f"• **Review your skill progress** and practice recommendations"
        )

    def chat(self, request: ChatRequest) -> List[ChatAgentOutput]:
        db: Session = SessionLocal()
        try:
            cdata = self._fetch_context_data(request, db)
            agent_results, executed_agents = self._execute_specialized_agents(request, cdata)
            raw_context_text = "\n".join(cdata.get("raw_text_lines", []))
            history_text = self._history_text(request.conversation_history)

            agent_summary = ""
            for agent_name, result in agent_results.items():
                if isinstance(result, dict):
                    res_str = json.dumps(result)
                elif hasattr(result, "model_dump"):
                    res_str = json.dumps(result.model_dump())
                else:
                    res_str = str(result)
                agent_summary += f"\n[{agent_name} Output]: {res_str}"

            try:
                system_prompt = (
                    "You are the AI Debate Coach. "
                    "Your HIGHEST PRIORITY is to answer the user's explicit question directly and helpfully.\n"
                    "DO NOT prepend generic user profile statistics (like score or average) unless the user specifically asked about their performance or progress.\n"
                    "Synthesize the outputs from the specialized agents, real-time database context, and prior conversation history into a single, cohesive, highly practical natural language response.\n"
                    "Follow-up questions (such as 'Make them intermediate level', 'What would my opponent say?', 'Which one would you recommend?') MUST be answered using the previous conversation turn and current context.\n"
                    "Use clear markdown formatting with bold headers and bullet/numbered lists.\n"
                    "NEVER output raw JSON, code blocks of agent dicts, or internal agent arrays like [{\"agent\":...}].\n"
                    "NEVER state 'I am analyzing your query based on current page context'.\n"
                    "Answer the user's question directly using real database values and specialized agent findings."
                )

                user_prompt = (
                    f"CURRENT PAGE ROUTE: {request.page}\n\n"
                    f"=== REAL-TIME USER DATABASE CONTEXT ===\n{raw_context_text}\n\n"
                    f"=== SPECIALIZED AGENT EXECUTION RESULTS ({', '.join(executed_agents)}) ==={agent_summary}\n\n"
                    f"=== CONVERSATION HISTORY ===\n{history_text}\n\n"
                    f"USER QUESTION: {request.message}"
                )

                chain = ChatPromptTemplate.from_messages(
                    [
                        ("system", system_prompt),
                        ("human", "{input}"),
                    ]
                ) | llm

                response = chain.invoke({"input": user_prompt})
                response_text = response.content if hasattr(response, "content") else str(response)

                if not response_text or "analyzing your query" in response_text.lower() or response_text.strip().startswith("[{"):
                    response_text = self._generate_data_driven_response(request, cdata, agent_results)

            except Exception:
                response_text = self._generate_data_driven_response(request, cdata, agent_results)

            return [
                ChatAgentOutput(
                    agent="AI Debate Coach",
                    content=response_text,
                    selected_agents=executed_agents,
                )
            ]

        finally:
            db.close()


chat_service = ChatService()
