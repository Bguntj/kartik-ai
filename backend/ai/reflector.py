from ai.agent_state import AgentState


# ==========================================
# Reflection
# ==========================================

def reflect(state: AgentState):

    print(
        "\n========== REFLECTION =========="
    )

    # ======================================
    # Basic State Checks
    # ======================================

    observations = getattr(
        state,
        "observations",
        []
    )

    used_tools = getattr(
        state,
        "used_tools",
        []
    )

    prompt = getattr(
        state,
        "prompt",
        ""
    )

    # ======================================
    # No Prompt
    # ======================================

    if not prompt:

        state.finished = True
        state.reflection = ""

        print("Reflection: No prompt")
        print("================================\n")

        return state

    # ======================================
    # Check Available Information
    # ======================================

    has_observations = bool(observations)
    has_tools = bool(used_tools)

    # ======================================
    # Determine Completion
    # ======================================

    if has_observations or has_tools:

        state.finished = True
        state.reflection = ""

    else:

        state.finished = True
        state.reflection = ""

    # ======================================
    # Debug
    # ======================================

    print(
        "Observations:",
        len(observations)
    )

    print(
        "Used Tools:",
        used_tools
    )

    print(
        "Complete:",
        state.finished
    )

    print(
        "Missing:",
        state.reflection
    )

    print(
        "================================\n"
    )

    return state