from fastapi import FastAPI
from database import users, debates, topics, feedbacks, tasks, user_feedbacks
from datetime import datetime
from fastapi import UploadFile, File, Form
import os
import shutil
import uuid
from bson import ObjectId
from fastapi import Form
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
from fastapi.staticfiles import StaticFiles
from services.speech_processing import transcribe_audio
from services.debate_analyzer import analyze_debate
from services.ollama_opponent import generate_ai_response
import concurrent.futures
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "AI Debate Coach Backend Running"
    }

@app.post("/register")
def register(data: dict):

    existing_user = users.find_one({
        "email": data["email"]
    })

    if existing_user:
        return {
            "success": False,
            "message": "Email already registered"
        }

    user = {
        "fullname": data["fullname"],
        "email": data["email"],
        "username": data["username"],
        "password": data["password"],
        "role": "Learner",
        "status": "Active"
    }

    users.insert_one(user)

    return {
        "success": True,
        "message": "Registered Successfully"
    }
@app.post("/login")
def login(data: dict):

    user = users.find_one({
        "email": data["email"]
    })

    if not user:
        return {
            "success": False,
            "message": "Email not found"
        }

    if user["password"] != data["password"]:
        return {
            "success": False,
            "message": "Wrong password"
        }

    if user.get("status", "Active") != "Active":
        return {
            "success": False,
            "message": "Account Blocked"
        }

    return {
    "success": True,
    "message": "Login Successful",
    "role": user["role"],
    "username": user["username"],
    "fullname": user["fullname"],
    "email": user["email"]
}
@app.post("/create-debate")
def create_debate(data: dict):

    debate = {
        "username": data["username"],
        "topic": data["topic"],
        "duration": data["duration"],
        "debate_type": data.get("debate_type", "One-to-One"),
        "status": "Started",
        "audio_path": "",
        "transcript": "",
        "confidence": 0,
        "fluency": 0,
        "argument_strength": 0,
        "communication": 0,
        "suggestions": [],
        "fallacies": [],
        "ai_response": "",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    result = debates.insert_one(debate)

    return {
        "success": True,
        "debate_id": str(result.inserted_id)
    }
@app.get("/debates")
def get_debates():

    result = []

    for debate in debates.find():

        debate["_id"] = str(debate["_id"])

        result.append(debate)

    return result
@app.post("/upload-audio")
async def upload_audio(
    debate_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:

        os.makedirs(
            "uploads",
            exist_ok=True
        )

        filename = (
            f"{uuid.uuid4()}_{file.filename}"
        )

        file_path = (
            f"uploads/{filename}"
        )

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )
        print("STEP 1: File Saved")
        # Speech To Text
        transcript = transcribe_audio(
            file_path
        )

        # Find Debate
        debate = debates.find_one(
            {
                "_id":
                ObjectId(debate_id)
            }
        )

        if not debate:

            return {
                "success": False,
                "message":
                "Debate not found"
            }
        print("STEP 2: Transcript Completed")
        # AI Opponent and Analysis in Parallel
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_response = executor.submit(generate_ai_response, debate["topic"], transcript)
            future_analysis = executor.submit(analyze_debate, debate["topic"], transcript)
            
            ai_response = future_response.result()
            analysis = future_analysis.result()

        print("\nAI RESPONSE:")
        print(ai_response)
        print("STEP 3: AI Response Completed") 
        print("STEP 4: Analysis Completed")
        print("STEP 4: Analysis Completed")
        print("\nANALYSIS:")
        print(analysis)

        # Save To Database
        debates.update_one(
            {
                "_id":
                ObjectId(debate_id)
            },
            {
                "$set": {

                    "audio_path":
                    file_path,

                    "status":
                    "Submitted",

                    "transcript":
                    transcript,

                    "confidence":
                    analysis.get(
                        "confidence",
                        0
                    ),

                    "fluency":
                    analysis.get(
                        "fluency",
                        0
                    ),

                    "argument_strength":
                    analysis.get(
                        "argument_strength",
                        0
                    ),

                    "communication":
                    analysis.get(
                        "communication",
                        0
                    ),

                    "fallacies":
                    analysis.get(
                        "fallacies",
                        []
                    ),

                    "suggestions":
                    analysis.get(
                        "suggestions",
                        []
                    ),

                    "ai_response":
                    ai_response

                }
            }
        )

        return {

            "success": True,

            "message":
            "Audio Uploaded Successfully",

            "transcript":
            transcript,

            "ai_response":
            ai_response,

            "analysis": {

                "confidence":
                analysis.get(
                    "confidence",
                    0
                ),

                "fluency":
                analysis.get(
                    "fluency",
                    0
                ),

                "argument_strength":
                analysis.get(
                    "argument_strength",
                    0
                ),

                "communication":
                analysis.get(
                    "communication",
                    0
                ),

                "fallacies":
                analysis.get(
                    "fallacies",
                    []
                ),

                "suggestions":
                analysis.get(
                    "suggestions",
                    []
                )

            }

        }

    except Exception as e:

        print(
            "UPLOAD ERROR:",
            str(e)
        )

        return {

            "success": False,

            "message":
            str(e)

        }

@app.post("/upload-text")
def upload_text(data: dict):
    debate_id = data.get("debate_id")
    transcript = data.get("text")
    try:
        debate = debates.find_one({"_id": ObjectId(debate_id)})
        if not debate:
            return {"success": False, "message": "Debate not found"}
            
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_response = executor.submit(generate_ai_response, debate["topic"], transcript)
            future_analysis = executor.submit(analyze_debate, debate["topic"], transcript)
            ai_response = future_response.result()
            analysis = future_analysis.result()
        
        debates.update_one(
            {"_id": ObjectId(debate_id)},
            {
                "$set": {
                    "status": "Submitted",
                    "transcript": transcript,
                    "confidence": analysis.get("confidence", 0),
                    "fluency": analysis.get("fluency", 0),
                    "argument_strength": analysis.get("argument_strength", 0),
                    "communication": analysis.get("communication", 0),
                    "fallacies": analysis.get("fallacies", []),
                    "suggestions": analysis.get("suggestions", []),
                    "ai_response": ai_response
                }
            }
        )
        
        return {
            "success": True,
            "message": "Text Uploaded Successfully",
            "transcript": transcript,
            "ai_response": ai_response,
            "analysis": {
                "confidence": analysis.get("confidence", 0),
                "fluency": analysis.get("fluency", 0),
                "argument_strength": analysis.get("argument_strength", 0),
                "communication": analysis.get("communication", 0),
                "fallacies": analysis.get("fallacies", []),
                "suggestions": analysis.get("suggestions", [])
            }
        }
    except Exception as e:
        print("UPLOAD TEXT ERROR:", str(e))
        return {"success": False, "message": str(e)}

@app.get("/users")
def get_users():

    result = []

    for user in users.find():
        user["_id"] = str(user["_id"])
        result.append(user)

    return result
@app.get("/users/role/{role}")
def get_users_by_role(role: str):

    result = []

    for user in users.find({"role": role}):

        user["_id"] = str(user["_id"])

        result.append(user)

    return result
@app.get("/admin/stats")
def admin_stats():

    return {
        "total_users": users.count_documents({}),
        "total_debates": debates.count_documents({}),
        "learners": users.count_documents({"role":"Learner"}),
        "educators": users.count_documents({"role":"Educator"}),
        "coaches": users.count_documents({"role":"Debate Coach"}),
        "admins": users.count_documents({"role":"Admin"})
    }

@app.get("/admin/reports/educators")
def admin_reports_educators():
    result = []
    educators = users.find({"role": "Educator"})
    for edu in educators:
        edu_name = edu.get("fullname", "")
        # Find tasks assigned by this educator
        edu_tasks = list(tasks.find({"sender_name": edu_name}))
        for t in edu_tasks:
            t["_id"] = str(t["_id"])
        
        # Find feedbacks given by this educator
        edu_feedbacks = list(user_feedbacks.find({"sender_name": edu_name, "sender_role": "Educator"}))
        for f in edu_feedbacks:
            f["_id"] = str(f["_id"])
            
        result.append({
            "fullname": edu_name,
            "username": edu.get("username", ""),
            "email": edu.get("email", ""),
            "assigned_tasks": edu_tasks,
            "given_feedbacks": edu_feedbacks,
            "total_tasks": len(edu_tasks),
            "total_feedbacks": len(edu_feedbacks)
        })
    return result

@app.get("/admin/reports/coaches")
def admin_reports_coaches():
    result = []
    coaches = users.find({"role": "Debate Coach"})
    for coach in coaches:
        coach_name = coach.get("fullname", "")
        # Find debates reviewed by this coach
        coach_reviews = list(feedbacks.find({"coach": coach_name}))
        for r in coach_reviews:
            r["_id"] = str(r["_id"])
            
        # Find direct feedbacks given by this coach
        coach_direct_feedbacks = list(user_feedbacks.find({"sender_name": coach_name, "sender_role": "Debate Coach"}))
        for f in coach_direct_feedbacks:
            f["_id"] = str(f["_id"])
            
        result.append({
            "fullname": coach_name,
            "username": coach.get("username", ""),
            "email": coach.get("email", ""),
            "reviewed_debates": coach_reviews,
            "given_feedbacks": coach_direct_feedbacks,
            "total_debates_reviewed": len(coach_reviews),
            "total_feedbacks": len(coach_direct_feedbacks)
        })
    return result
@app.post("/admin/create-user")
def create_user(data: dict):

    if users.find_one({"email": data["email"]}):
        return {
            "success": False,
            "message": "Email already exists"
        }

    if users.find_one({"username": data["username"]}):
        return {
            "success": False,
            "message": "Username already exists"
        }

    users.insert_one(data)

    return {
        "success": True,
        "message": "User Created Successfully"
    }
@app.delete("/users/{user_id}")
def delete_user(user_id: str):

    users.delete_one({
        "_id": ObjectId(user_id)
    })

    return {
        "success": True,
        "message": "User Deleted Successfully"
    }
@app.put("/users/{user_id}/status")
def update_status(user_id: str, data: dict):

    users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "status": data["status"]
            }
        }
    )

    return {
        "success": True,
        "message": "Status Updated"
    }
@app.post("/topics")
def create_topic(data: dict):

    topic = {
        "title": data["title"],
        "category": data["category"],
        "difficulty": data["difficulty"],
        "created_by": data["created_by"],
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    topics.insert_one(topic)

    return {
        "success": True,
        "message": "Topic Created Successfully"
    }
@app.get("/topics")
def get_topics():

    result = []

    for topic in topics.find():

        topic["_id"] = str(topic["_id"])

        result.append(topic)

    return result
@app.delete("/topics/{topic_id}")
def delete_topic(topic_id: str):

    topics.delete_one({
        "_id": ObjectId(topic_id)
    })

    return {
        "success": True,
        "message": "Topic Deleted"
    }
@app.post("/feedback")
def create_feedback(data: dict):

    debate = debates.find_one(
        {"_id": ObjectId(data["debate_id"])}
    )

    feedback = {

        "debate_id": data["debate_id"],

        "username": debate["username"],

        "topic": debate["topic"],

        "coach": data["coach"],

        "confidence": data["confidence"],

        "fluency": data["fluency"],

        "communication": data["communication"],

        "argument_strength":
        data["argument_strength"],

        "feedback": data["feedback"],

        "created_at":
        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    }

    feedbacks.insert_one(feedback)

    debates.update_one(
        {"_id": ObjectId(data["debate_id"])},
        {
            "$set": {
                "status": "Reviewed"
            }
        }
    )

    return {
        "success": True,
        "message":
        "Feedback Submitted Successfully"
    }
@app.get("/feedback/{debate_id}")
def get_feedback(debate_id: str):

    result = []

    for feedback in feedbacks.find({"debate_id": debate_id}):

        feedback["_id"] = str(feedback["_id"])

        result.append(feedback)

    return result
@app.get("/coach/debates")
def coach_debates():

    result = []

    for debate in debates.find({"status":"Submitted"}):

        debate["_id"] = str(debate["_id"])

        result.append(debate)

    return result
@app.get("/debates/{username}")
def get_user_debates(username: str):

    result = []

    for debate in debates.find({"username": username}):
        debate["_id"] = str(debate["_id"])
        result.append(debate)

    return result
@app.post("/admin/send-feedback")
def send_feedback(data: dict):

    feedback = {
        "username": data["username"],
        "message": data["message"],
        "sender_name": data["sender_name"],
        "sender_role": data["sender_role"],
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    feedbacks.insert_one(feedback)

    return {
        "success": True,
        "message": "Feedback Sent Successfully"
    }
@app.get("/user-feedback/{username}")
def get_user_feedback(username: str):

    result = []

    # Coach + Admin feedbacks
    for item in feedbacks.find({"username": username}):

        item["_id"] = str(item["_id"])

        # Coach review
        if "coach" in item:

            item["sender_name"] = item.get(
                "coach",
                "Coach"
            )

            item["sender_role"] = "Debate Coach"

        result.append(item)

    # Educator feedbacks
    for item in user_feedbacks.find(
        {"username": username}
    ):

        item["_id"] = str(item["_id"])

        result.append(item)

    return result
@app.post("/assign-task")
def assign_task(data: dict):

    task = {
        "username": data.get("username", ""),
        "topic": data.get("topic", ""),
        "duration": data.get("duration", ""),
        "debate_type": data.get("debate_type", ""),
        "sender_name": data.get("sender_name", ""),
        "sender_role": data.get("sender_role", "")
    }

    tasks.insert_one(task)

    return {
        "success": True,
        "message": "Task Assigned Successfully"
    }
@app.get("/tasks/{username}")
def get_tasks(username: str):

    result = []

    for task in tasks.find({
        "username": username,
        "status": {"$ne": "Completed"}
    }):

        task["_id"] = str(task["_id"])

        result.append(task)

    return result
@app.delete("/tasks/{task_id}")
def delete_task(task_id: str):

    tasks.delete_one(
        {"_id": ObjectId(task_id)}
    )

    return {
        "success": True,
        "message": "Task Deleted"
    }
@app.post("/send-feedback")
def send_feedback(data: dict):

    feedback = {
        "username": data["username"],
        "message": data["message"],
        "sender_name": data["sender_name"],
        "sender_role": data["sender_role"],
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    user_feedbacks.insert_one(feedback)

    return {
        "success": True,
        "message": "Feedback Sent Successfully"
    }
@app.get("/educator/learners-count")
def learners_count():
    return {
        "count": users.count_documents({
            "role":"Learner"
        })
    }
@app.get("/educator/tasks-count")
def tasks_count():

    return {
        "count": tasks.count_documents({})
    }
@app.get("/educator/feedback-count")
def feedback_count():

    return {
        "count": user_feedbacks.count_documents({})
    }
@app.get("/educator/reports")
def educator_reports():

    result = []

    learners = users.find({"role": "Learner"})

    for learner in learners:
        username = learner["username"]
        
        learner_debates = list(debates.find({"username": username}))
        sum_score = 0
        for d in learner_debates:
            c = d.get("confidence", 0)
            f = d.get("fluency", 0)
            a = d.get("argument_strength", 0)
            cm = d.get("communication", 0)
            sum_score += ((c + f + a + cm) / 4) * 10
            
        avg_score = round(sum_score / len(learner_debates)) if learner_debates else 0

        result.append({
            "fullname": learner["fullname"],
            "email": learner["email"],
            "username": username,
            "tasks": tasks.count_documents({
                "username": username
            }),
            "debates": len(learner_debates),
            "average_score": avg_score,
            "feedbacks": user_feedbacks.count_documents({
                "username": username
            })
        })

    return result

@app.get("/educator/tasks")
def educator_get_tasks():
    result = []
    for task in tasks.find():
        task["_id"] = str(task["_id"])
        user = users.find_one({"username": task.get("username")})
        task["fullname"] = user.get("fullname", task.get("username", "Unknown"))
        result.append(task)
    return result

@app.get("/educator/feedbacks")
def educator_get_feedbacks():
    result = []
    for f in user_feedbacks.find():
        f["_id"] = str(f["_id"])
        user = users.find_one({"username": f.get("username")})
        f["fullname"] = user.get("fullname", f.get("username", "Unknown"))
        f["role"] = user.get("role", "Learner")
        result.append(f)
    return result

@app.get("/educator/learner-debates/{username}")
def educator_learner_debates(username: str):
    result = []
    for d in debates.find({"username": username}).sort("created_at", -1):
        d["_id"] = str(d["_id"])
        result.append(d)
    return result


@app.get("/tasks")
def get_all_tasks():

    result = []

    for task in tasks.find():

        task["_id"] = str(task["_id"])

        user = users.find_one({
            "username": task["username"]
        })

        task["fullname"] = user.get("fullname", "")
        task["email"] = user.get("email", "")

        result.append(task)

    return result
@app.get("/all-feedbacks")
def get_all_feedbacks():

    result = []

    for item in user_feedbacks.find():

        item["_id"] = str(item["_id"])

        learner = users.find_one({
            "username": item["username"]
        })

        result.append({

            "_id": item["_id"],

            "learner_name":
            learner.get("fullname", "")
            if learner else "",

            "learner_role":
            learner.get("role", "")
            if learner else "Learner",

            "learner_email":
            learner.get("email", "")
            if learner else "",

            "message":
            item.get("message", ""),

            "sender_name":
            item.get("sender_name", ""),

            "sender_role":
            item.get("sender_role", ""),

            "created_at":
            item.get("created_at", "")
        })

    return result
@app.get("/coach/reviewed-debates")
def reviewed_debates():

    result = []

    for debate in debates.find({"status":"Reviewed"}):

        debate["_id"] = str(debate["_id"])

        result.append(debate)

    return result
@app.get("/review/{debate_id}")
def get_review(debate_id: str):

    feedback = feedbacks.find_one(
        {"debate_id": debate_id}
    )

    debate = debates.find_one(
        {"_id": ObjectId(debate_id)}
    )

    if not debate:
        return {}

    return {

        "topic":
        debate.get("topic", ""),

        "username":
        debate.get("username", ""),

        "coach":
        feedback.get("coach", "")
        if feedback else "",

        "feedback":
        feedback.get("feedback", "")
        if feedback else "",

        "communication":
debate.get("communication", 0),

"confidence":
debate.get("confidence", 0),

"fluency":
debate.get("fluency", 0),

"argument_strength":
debate.get("argument_strength", 0),

        "transcript":
        debate.get("transcript", ""),

        "fallacies":
        debate.get("fallacies", []),

        "suggestions":
        debate.get("suggestions", []),

        "ai_response":
        debate.get("ai_response", "")
        
    }
@app.get("/coach-feedback/{username}")
def get_coach_feedback(username: str):

    result = []

    for feedback in feedbacks.find(
        {"username": username}
    ):

        debate = debates.find_one(
            {
                "_id": ObjectId(
                    feedback["debate_id"]
                )
            }
        )

        result.append({

            "_id": str(feedback["_id"]),

            "topic":
            feedback.get("topic", ""),

            "coach":
            feedback.get("coach", ""),

            "feedback":
            feedback.get("feedback", ""),

            "confidence":
            feedback.get(
                "confidence", 0
            ),

            "fluency":
            feedback.get(
                "fluency", 0
            ),

            "communication":
            feedback.get(
                "communication", 0
            ),

            "argument_strength":
            feedback.get(
                "argument_strength", 0
            ),

            "transcript":
            debate.get(
                "transcript", ""
            ) if debate else "",

            "fallacies":
            debate.get(
                "fallacies", []
            ) if debate else [],

            "suggestions":
            debate.get(
                "suggestions", []
            ) if debate else [],

            "ai_response":
            debate.get(
                "ai_response", ""
            ) if debate else "",

            "sender_name":
            feedback.get(
                "coach", "Coach"
            ),

            "sender_role":
            "Debate Coach"

        })

    return result
from bson import ObjectId
from bson.errors import InvalidId

@app.get("/ai-response/{debate_id}")
def get_ai_response(debate_id: str):

    try:
        debate = debates.find_one(
            {"_id": ObjectId(debate_id)}
        )

        if not debate:
            return {
                "response": "Debate not found"
            }

        return {
            "response": debate.get(
                "ai_response",
                "No AI response available"
            )
        }

    except InvalidId:
        return {
            "response": "Invalid Debate ID"
        }
@app.put("/tasks/complete/{task_id}")
def complete_task(task_id: str):

    tasks.update_one(
        {"_id": ObjectId(task_id)},
        {
            "$set": {
                "status": "Completed"
            }
        }
    )

    return {
        "success": True,
        "message": "Task Completed"
    }

from services.debate_chatbot import debate_chat

@app.post("/ai-chat")
def ai_chat_endpoint(data: dict):
    username = data.get("username", "Learner")
    message = data.get("message", "")
    context = data.get("context", "")
    
    # Don't treat the UI widget name as a debate topic
    if context in ["widget", "floating_widget"]:
        context = "General Debate Topics"
        
    reply = debate_chat(context, message)
        
    return {
        "success": True,
        "reply": reply,
        "scores": None
    }