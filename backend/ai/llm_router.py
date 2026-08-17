from ai.gemini import generate_response


# ==========================================
# Planner LLM
# ==========================================

def planner_llm(prompt):

    return generate_response(

        prompt=prompt,

        model="gemini-2.5-flash",
    )


# ==========================================
# Final Answer LLM
# ==========================================

def answer_llm(

    prompt,

    image=None,

    session_id=None,

    rag_context=None,

    web_context=None,

    user_prompt=None,

):

    return generate_response(

        # Full final prompt
        prompt=prompt,

        # Image path
        image_path=image,

        # Model
        model="gemini-2.5-flash",

        # Session
        session_id=session_id,

        # Context
        rag_context=rag_context,

        web_context=web_context,

        # IMPORTANT:
        # Original user question
        user_prompt=user_prompt,
    )