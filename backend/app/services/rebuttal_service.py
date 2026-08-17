def generate_rebuttal(opponent_argument: str):

    rebuttal = f"""
Your opponent argues:

"{opponent_argument}"

Possible Rebuttal:

Although this argument has some merit, it ignores important practical limitations.
A stronger position should include evidence, real-world examples, and consideration of opposing viewpoints before reaching a conclusion.
"""

    return {
        "rebuttal": rebuttal.strip()
    }