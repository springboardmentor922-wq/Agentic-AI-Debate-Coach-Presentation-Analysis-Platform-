import os
from dotenv import load_dotenv

# Load env before importing services!
load_dotenv()

from services.speech_processing import transcribe_audio
from services.ollama_opponent import generate_ai_response
from services.debate_analyzer import analyze_debate

if __name__ == "__main__":
    print("Testing STT...")
    try:
        with open("uploads/test_audio.wav", "wb") as f:
            f.write(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00")
        
        text = transcribe_audio("uploads/test_audio.wav")
        print("STT Result:", text)
        
        print("Testing AI Opponent...")
        opp = generate_ai_response("AI", text)
        print("Opponent Result:", opp)
        
        print("Testing Analyzer...")
        ana = analyze_debate("AI", text)
        print("Analyzer Result:", ana)
    except Exception as e:
        print("Error:", str(e))
