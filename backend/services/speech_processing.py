import os
import requests

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def transcribe_audio(audio_path):
    print("Transcribing via Groq Whisper API:", audio_path)
    
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }
    
    try:
        with open(audio_path, "rb") as file:
            files = {
                "file": (os.path.basename(audio_path), file)
            }
            data = {
                "model": "whisper-large-v3-turbo",
                "language": "en"
            }
            
            response = requests.post(url, headers=headers, files=files, data=data)
            
        result = response.json()
        print("\n===== GROQ STT OUTPUT =====")
        print(result)
        print("==========================\n")
        
        return result.get("text", "")
    except Exception as e:
        print("GROQ STT ERROR:", str(e))
        return ""


if __name__ == "__main__":

    text = transcribe_audio(
        "uploads/debate.wav"
    )

    print("\nTranscript:\n")
    print(text)