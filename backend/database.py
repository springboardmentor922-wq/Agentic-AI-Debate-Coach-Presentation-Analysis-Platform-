from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

db = client["debate_coach"]

users = db["users"]
debates = db["debates"]
topics = db["topics"]
feedbacks = db["feedbacks"]
tasks = db["tasks"]
user_feedbacks = db["user_feedbacks"]
chat_history = db["chat_history"]