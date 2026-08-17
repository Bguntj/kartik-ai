import re

from memory import get_memory_value


# ==========================================
# Local Fallback
# ==========================================

def local_fallback(
    prompt,
    session_id=None,
    rag_context=None,
    web_context=None,
):
    """
    Local response system used when Gemini
    is unavailable.

    Priority:

    1. Memory
    2. Web context
    3. RAG context
    4. Local knowledge
    5. Basic calculations
    6. Greeting
    7. Safe fallback
    """

    prompt = str(prompt or "").strip()

    prompt_lower = prompt.lower()

    rag_context = str(
        rag_context or ""
    ).strip()

    web_context = str(
        web_context or ""
    ).strip()

    # ==========================================
    # Empty Prompt
    # ==========================================

    if not prompt:

        return (
            "Please enter a question."
        )

    # ==========================================
    # MEMORY
    # ==========================================

    if session_id is not None:

        # --------------------------------------
        # Name
        # --------------------------------------

        name_questions = [
            "my name",
            "what is my name",
            "whats my name",
            "what's my name",
            "who am i",
            "who am i?",
        ]

        if any(
            phrase in prompt_lower
            for phrase in name_questions
        ):

            try:

                name = get_memory_value(
                    session_id,
                    "name"
                )

            except Exception as e:

                print(
                    "⚠️ Local memory error:",
                    e
                )

                name = None

            if name:

                return (
                    f"Your name is {name}."
                )

            return (
                "I don't have your name saved "
                "in memory yet."
            )

        # --------------------------------------
        # What does AI know about user?
        # --------------------------------------

        if (
            "what do you know about me"
            in prompt_lower
        ):

            try:

                name = get_memory_value(
                    session_id,
                    "name"
                )

            except Exception:

                name = None

            if name:

                return (
                    "I currently remember that "
                    f"your name is {name}."
                )

            return (
                "I don't currently have any "
                "saved information about you."
            )

    # ==========================================
    # WEB CONTEXT
    # ==========================================

    if web_context:

        return (
            "### Information available\n\n"
            + web_context
        )

    # ==========================================
    # RAG / DOCUMENT CONTEXT
    # ==========================================

    if rag_context:

        return (
            "### Information from your documents\n\n"
            + rag_context
        )

    # ==========================================
    # BASIC LOCAL KNOWLEDGE
    # ==========================================

    # ------------------------------------------
    # Python
    # ------------------------------------------

    if (
        "what is python" in prompt_lower
        or prompt_lower == "python"
        or prompt_lower == "what's python"
        or prompt_lower == "whats python"
    ):

        return (
            "### Python\n\n"
            "Python is a high-level, general-purpose "
            "programming language known for its simple "
            "and readable syntax.\n\n"
            "It is widely used for:\n"
            "- Web development\n"
            "- Automation\n"
            "- Data science\n"
            "- Machine learning\n"
            "- Artificial intelligence\n"
            "- Software development"
        )

    # ------------------------------------------
    # JavaScript
    # ------------------------------------------

    if (
        "what is javascript"
        in prompt_lower
        or prompt_lower == "javascript"
    ):

        return (
            "### JavaScript\n\n"
            "JavaScript is a programming language "
            "commonly used to create interactive and "
            "dynamic web pages. It can also be used "
            "for backend development with platforms "
            "such as Node.js."
        )

    # ------------------------------------------
    # HTML
    # ------------------------------------------

    if (
        "what is html" in prompt_lower
        or prompt_lower == "html"
    ):

        return (
            "### HTML\n\n"
            "HTML stands for HyperText Markup Language. "
            "It is used to structure content on web pages."
        )

    # ------------------------------------------
    # CSS
    # ------------------------------------------

    if (
        "what is css" in prompt_lower
        or prompt_lower == "css"
    ):

        return (
            "### CSS\n\n"
            "CSS stands for Cascading Style Sheets. "
            "It is used to control the appearance, "
            "layout, and styling of web pages."
        )

    # ------------------------------------------
    # React
    # ------------------------------------------

    if (
        "what is react" in prompt_lower
        or prompt_lower == "react"
    ):

        return (
            "### React\n\n"
            "React is a JavaScript library used "
            "to build user interfaces, especially "
            "component-based web applications."
        )

    # ------------------------------------------
    # FastAPI
    # ------------------------------------------

    if (
        "what is fastapi"
        in prompt_lower
        or prompt_lower == "fastapi"
    ):

        return (
            "### FastAPI\n\n"
            "FastAPI is a Python web framework "
            "for building APIs. It is designed "
            "for high performance and provides "
            "automatic API documentation."
        )

    # ------------------------------------------
    # FAISS
    # ------------------------------------------

    if (
        "what is faiss"
        in prompt_lower
        or prompt_lower == "faiss"
    ):

        return (
            "### FAISS\n\n"
            "FAISS is a library for efficient "
            "similarity search and clustering of "
            "dense vectors. It is commonly used "
            "in semantic search and vector databases."
        )

    # ==========================================
    # BASIC MATH
    # ==========================================

    math_match = re.fullmatch(
        r"\s*([0-9]+(?:\s*[\+\-\*/]\s*[0-9]+)+)\s*",
        prompt
    )

    if math_match:

        expression = math_match.group(1)

        try:

            # Only allow numbers and basic operators.
            # No arbitrary Python execution.

            if not re.fullmatch(
                r"[0-9+\-*/\s]+",
                expression
            ):

                raise ValueError(
                    "Invalid expression"
                )

            result = eval(
                expression,
                {
                    "__builtins__": {}
                },
                {}
            )

            return (
                f"{expression} = {result}"
            )

        except Exception:

            pass

    # ==========================================
    # SIMPLE GREETING
    # ==========================================

    if prompt_lower in [
        "hi",
        "hello",
        "hey",
        "hii",
        "helo",
        "good morning",
        "good afternoon",
        "good evening",
    ]:

        return (
            "Hello! How can I help you?"
        )

    # ==========================================
    # THANK YOU
    # ==========================================

    if prompt_lower in [
        "thanks",
        "thank you",
        "thankyou",
        "thx",
    ]:

        return (
            "You're welcome!"
        )

    # ==========================================
    # LOCAL HELP
    # ==========================================

    if (
        "what can you do"
        in prompt_lower
    ):

        return (
            "I can help with questions, "
            "programming, documents, calculations, "
            "memory, and other tasks supported by "
            "the available system."
        )

    # ==========================================
    # FINAL SAFE FALLBACK
    # ==========================================

    return (
        "Gemini is currently unavailable because "
        "the API quota has been exceeded.\n\n"
        "I don't have enough reliable local "
        "information to answer this question "
        "accurately right now."
    )