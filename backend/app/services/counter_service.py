def generate_counter_arguments(topic: str, position: str):

    if position.lower() == "for":

        return {
            "counter_arguments": [
                f"Some people argue that {topic} has serious disadvantages.",
                "There may be ethical concerns.",
                "Long-term consequences are uncertain.",
                "There are better alternatives.",
                "Human judgment is still important."
            ]
        }

    return {
        "counter_arguments": [
            f"Supporters believe {topic} improves efficiency.",
            "Technology can solve many existing problems.",
            "It saves time and resources.",
            "Many organizations already use it successfully.",
            "Future advancements may solve today's limitations."
        ]
    }