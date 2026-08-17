def write_text(text, context=None):
    """
    Prepare a writing request for the final LLM.

    The actual writing is handled by the final
    LLM so this skill does not make an additional
    Gemini/API request.
    """

    if not text:
        return ""

    text = str(text).strip()

    if not text:
        return ""

    writing_context = f"""
========== WRITING REQUEST ==========

Write a clear, natural, and well-structured
response based on the user's request.

Preserve the user's intended meaning and
follow the requested format, tone, and length.

User Request:
{text}

======================================
"""

    return writing_context.strip()