import requests
res = requests.post("http://localhost:8000/ai-chat", json={"message": "suggest me some topics", "context": "widget"})
print(res.json())
