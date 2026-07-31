import os
from services.speech_processing import transcribe_audio

if __name__ == "__main__":
    if os.path.exists("uploads/debate.wav"):
        print("File exists, testing STT...")
        text = transcribe_audio("uploads/debate.wav")
        print("Final result:", text)
    else:
        print("No test file found")
