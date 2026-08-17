def research(text, context=None):
    """
    Research skill.

    Receives collected information from
    web, RAG, memory, or other tools and
    formats it as research context.
    """

    if not text:
        return ""

    research_context = f"""
========== RESEARCH CONTEXT ==========

The following information was collected
from external research tools.

{text}

=======================================
"""

    return research_context.strip()