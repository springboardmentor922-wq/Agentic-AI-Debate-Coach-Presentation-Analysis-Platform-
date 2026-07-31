def detect_fallacies(transcript):

    transcript = transcript.lower()

    fallacies = []

    if "everyone" in transcript:
        fallacies.append(
            "Hasty Generalization"
        )

    if "because my friend said" in transcript:
        fallacies.append(
            "Appeal to Authority"
        )

    if "always" in transcript:
        fallacies.append(
            "Overgeneralization"
        )

    if len(fallacies) == 0:
        fallacies.append(
            "No Major Fallacies Detected"
        )

    return fallacies