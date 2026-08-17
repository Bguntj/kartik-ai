def translate(text, context=None):
    """
    Prepare a translation request for the final LLM.

    The actual translation is handled by the final
    LLM, so this skill does not make an additional
    Gemini/API request.
    """

    if not text:
        return ""

    text = str(text).strip()

    if not text:
        return ""

    translation_context = f"""
========== TRANSLATION REQUEST ==========

Translate the following text into the language
requested by the user.

Preserve the original meaning, tone, formatting,
and important details.

User Request:
{text}

==========================================
"""

    return translation_context.strip()