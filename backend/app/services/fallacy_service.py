def detect_fallacies(argument: str):

    text = argument.lower()

    fallacies = []
    explanations = []
    suggestions = []

    if "everyone" in text:
        fallacies.append("Bandwagon")
        explanations.append(
            "Assumes something is true because everyone believes it."
        )
        suggestions.append(
            "Use evidence instead of popularity."
        )

    if "always" in text or "never" in text:
        fallacies.append("Hasty Generalization")
        explanations.append(
            "Makes an absolute claim without sufficient evidence."
        )
        suggestions.append(
            "Avoid words like 'always' or 'never'."
        )

    if "because i said so" in text:
        fallacies.append("Appeal to Authority")
        explanations.append(
            "Relies on authority instead of evidence."
        )
        suggestions.append(
            "Support the claim with facts."
        )

    if len(fallacies) == 0:

        fallacies.append("No major logical fallacies detected.")

        explanations.append(
            "The argument appears logically consistent."
        )

        suggestions.append(
            "Continue strengthening the argument with evidence."
        )

    return {

        "detected_fallacies": fallacies,

        "explanation": explanations,

        "suggestions": suggestions

    }