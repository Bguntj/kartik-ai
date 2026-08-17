from datetime import datetime
from ai.memory_retriever import build_memory_context


def build_prompt(
    session_id,
    prompt,
    document="",
    context=""
):

    today = datetime.now().strftime(
        "%d %B %Y %I:%M %p"
    )


    memory_context = build_memory_context(
        session_id
    )


    final_prompt = f"""

You are Kartik AI, an advanced AI assistant.

Current Date and Time:
{today}


====================
USER MEMORY
====================

{memory_context}


====================
AVAILABLE KNOWLEDGE
====================

{document}


====================
CHAT HISTORY
====================

{context}


====================
USER QUESTION
====================

{prompt}


====================
INSTRUCTIONS
====================

Answer the user using the available knowledge.

Rules:

1. If web information is provided, use it.
2. If document information is provided, use it.
3. Do not mention internal tools.
4. Do not mention "web search" unless user asks.
5. Never invent facts.
6. If information is missing, clearly say that.
7. Use Markdown formatting.
8. Use code blocks for programming answers.

"""


    return final_prompt