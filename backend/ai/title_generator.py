from ai.gemini import generate_response


def generate_chat_title(first_message: str) -> str:
    """
    Generate a short AI title.
    """

    prompt = f"""
Generate a concise chat title.

Rules:
- Maximum 5 words.
- No quotes.
- No emoji.
- No punctuation at the end.
- Return ONLY the title.

User Message:

{first_message}
"""

    try:

        title = generate_response(prompt)

        title = (
            title
            .replace('"', "")
            .replace("\n", "")
            .strip()
        )

        if not title:
            return "New Chat"

        return title[:40]

    except Exception:

        return first_message[:40]