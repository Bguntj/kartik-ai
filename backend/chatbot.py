from ai.react_agent import run_agent

from memory import (
    get_last_chats,
    save_memory,
)

from ai.memory_extractor import extract_memory

from ai.prompt_builder import build_prompt

from ai.llm_router import answer_llm


# ==========================================
# Build Chat History
# ==========================================

def build_chat_context(session_id):

    history = get_last_chats(
        session_id
    )

    if not history:

        return ""


    context = ""


    for chat in history:

        context += f"""
User:
{chat.user}

Assistant:
{chat.bot}

---
"""


    return context


# ==========================================
# Main Chat Function
# ==========================================

def ask_gemini(
    session_id,
    prompt
):

    print(
        "\n" + "=" * 70
    )

    print(
        "🚀 KARTIK AI CHAT"
    )

    print(
        "=" * 70
    )

    print(
        "Session:",
        session_id
    )

    print(
        "Original User Prompt:",
        prompt
    )


    # ==========================================
    # Chat History
    # ==========================================

    context = build_chat_context(
        session_id
    )


    # ==========================================
    # Memory Extraction
    # ==========================================

    try:

        memories = extract_memory(
            prompt
        )


        print(
            "\n========== MEMORY =========="
        )

        print(
            memories
        )

        print(
            "============================"
        )


        if memories:

            for key, value in memories.items():

                save_memory(

                    session_id,

                    key,

                    value

                )


    except Exception as e:

        print(
            "⚠️ Memory Error:",
            e
        )


    # ==========================================
    # Agent Execution
    # ==========================================

    try:

        state = run_agent(

            session_id,

            prompt

        )


    except Exception as e:

        print(
            "\n❌ Agent Error:",
            e
        )

        return (
            "Sorry, I couldn't complete the request "
            "because the AI agent encountered an error."
        )


    # ==========================================
    # Safe State Values
    # ==========================================

    web_context = getattr(

        state,

        "web",

        ""

    ) or ""


    rag_context = getattr(

        state,

        "rag",

        ""

    ) or ""


    memory_context = getattr(

        state,

        "memory",

        ""

    ) or ""


    image = getattr(

        state,

        "image",

        None

    )


    observations = getattr(

        state,

        "observations",

        []

    ) or []


    # ==========================================
    # Build Document Context
    # ==========================================

    document_context = ""


    if rag_context:

        document_context += (
            rag_context
        )


    if web_context:

        if document_context:

            document_context += "\n\n"


        document_context += (
            web_context
        )


    # ==========================================
    # Build Final Prompt
    # ==========================================

    final_prompt = build_prompt(

        session_id=session_id,

        prompt=prompt,

        document=document_context,

        context=(

            context

            + "\n\n"

            + memory_context

        )

    )


    # ==========================================
    # Debug Information
    # ==========================================

    print(
        "\n" + "=" * 70
    )

    print(
        "🧠 KARTIK AI AGENT"
    )

    print(
        "=" * 70
    )


    print(
        "Session:",
        session_id
    )


    print(
        "Original Prompt:",
        prompt
    )


    print(
        "Web:",
        "Loaded"
        if web_context
        else "None"
    )


    print(
        "RAG:",
        "Loaded"
        if rag_context
        else "None"
    )


    print(
        "Memory:",
        "Loaded"
        if memory_context
        else "None"
    )


    print(
        "Image:",
        "Loaded"
        if image
        else "None"
    )


    print(
        "Image Path:",
        image
        if image
        else "None"
    )


    print(
        "Observations:"
    )


    for obs in observations:

        if isinstance(
            obs,
            dict
        ):

            print(
                "-",
                obs.get(
                    "tool",
                    "unknown"
                )
            )

        else:

            print(
                "-",
                obs
            )


    print(
        "=" * 70
    )


    # ==========================================
    # Final Gemini Answer
    # ==========================================

    try:

        print(
            "\n========== FINAL PROMPT =========="
        )


        print(
            final_prompt[:3000]
        )


        print(
            "=================================="
        )


        answer = answer_llm(

            # Full prompt for Gemini
            prompt=final_prompt,

            # Image path
            image=image,

            # Session
            session_id=session_id,

            # Context
            rag_context=rag_context,

            web_context=web_context,

            # IMPORTANT:
            # Original user question
            user_prompt=prompt,

        )


        # ==========================================
        # Empty Answer
        # ==========================================

        if not answer:

            print(
                "⚠️ Gemini returned empty response"
            )

            return (
                "Sorry, I couldn't generate an answer."
            )


        # ==========================================
        # Debug Answer
        # ==========================================

        print(
            "\n========== GEMINI ANSWER =========="
        )

        print(
            answer
        )

        print(
            "==================================="
        )


        return answer


    except Exception as e:

        error_text = str(e)


        print(
            "\n❌ Gemini Final Error:"
        )

        print(
            error_text
        )


        # ==========================================
        # Quota Error
        # ==========================================

        if (
            "429" in error_text
            or "RESOURCE_EXHAUSTED"
            in error_text
            or "quota"
            in error_text.lower()
        ):

            return (
                "⚠️ Gemini API quota has been exceeded. "
                "Please try again later."
            )


        # ==========================================
        # Generic Error
        # ==========================================

        return (
            "❌ Gemini error: "
            + error_text
        )