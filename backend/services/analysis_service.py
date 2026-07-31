def analyze_transcript(transcript):

    word_count = len(transcript.split())

    confidence = min(10, max(5, word_count // 8))
    fluency = min(10, max(5, word_count // 10))
    argument_strength = 5

    if "therefore" in transcript.lower():
        argument_strength += 2

    if "because" in transcript.lower():
        argument_strength += 1

    argument_strength = min(argument_strength, 10)

    return {
        "confidence": confidence,
        "fluency": fluency,
        "argument_strength": argument_strength
    }