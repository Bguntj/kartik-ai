def summarize(text, context=None):
    """
    Prepare text for summarization.

    The actual summary generation is handled by the
    final LLM, so this skill does not make another
    Gemini/API request.
    """

    if not text:
        return ""

    text = str(text).strip()

    if not text:
        return ""

    summary_context = f"""
========== SUMMARY REQUEST ==========

Summarize the following content clearly
and concisely while preserving the important
facts and key points.

{text}

======================================
"""

    return summary_context.strip()