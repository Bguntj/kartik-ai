# ==========================================
# AI SEARCH ROUTER
# ==========================================

CURRENT_KEYWORDS = [
    "latest",
    "today",
    "news",
    "weather",
    "stock",
    "price",
    "bitcoin",
    "ipl",
    "cricket",
    "football",
    "current",
    "live",
    "recent",
    "now",
]

RESEARCH_KEYWORDS = [
    "research",
    "compare",
    "comparison",
    "difference between",
    "according to",
    "source",
    "sources",
    "verify",
    "fact check",
]


def should_search(query: str) -> bool:

    if not query:
        return False

    query = query.lower().strip()

    # ------------------------------------------
    # Current information
    # ------------------------------------------

    for keyword in CURRENT_KEYWORDS:

        if keyword in query:
            return True

    # ------------------------------------------
    # Explicit research request
    # ------------------------------------------

    for keyword in RESEARCH_KEYWORDS:

        if keyword in query:
            return True

    # ------------------------------------------
    # General knowledge
    # ------------------------------------------
    #
    # IMPORTANT:
    # Don't automatically search every
    # "what is" / "how" question.
    #
    # Gemini can answer stable knowledge
    # without web search.
    #

    return False
SEARCH_KEYWORDS = [

    # Current information
    "latest",
    "today",
    "news",
    "weather",
    "stock",
    "price",
    "bitcoin",
    "ipl",
    "cricket",
    "football",
    "current",
    "live",

    # General knowledge / research
    "what is",
    "who is",
    "why",
    "how",
    "explain",
    "history",
    "information about",
    "research",
    "compare",
    "difference between",
]


def should_search(query):

    if not query:
        return False

    query = query.lower().strip()

    for word in SEARCH_KEYWORDS:

        if word in query:
            return True

    return False