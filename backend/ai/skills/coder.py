def generate_code(text, context=None):
    """
    Prepare coding requests for the final AI response.

    The actual code generation is handled by the
    final LLM response, so this skill should not
    make another Gemini/API request.
    """

    if not text:
        return ""

    return text.strip()