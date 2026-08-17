from events.event_bus import event_bus

from ai.skill_registry import SKILLS as SKILL_REGISTRY


# ==========================================
# Skill Messages
# ==========================================

SKILL_MESSAGES = {
    "writer": "Writing response...",
    "summarizer": "Summarizing...",
    "translator": "Translating...",
    "research": "Researching...",
    "coder": "Generating code...",
    "maths": "Solving maths...",
}


# ==========================================
# Execute Skills
# ==========================================

def execute_skills(state, selected_skills):

    # ======================================
    # No Skills
    # ======================================

    if not selected_skills:

        return state

    # ======================================
    # Execute Selected Skills
    # ======================================

    for skill in selected_skills:

        # ----------------------------------
        # Validate Skill
        # ----------------------------------

        if skill not in SKILL_REGISTRY:

            print(
                f"⚠️ Unknown skill: {skill}"
            )

            continue

        # ----------------------------------
        # Skill Started
        # ----------------------------------

        event_bus.emit(
            "skill_start",
            {
                "skill": skill,
                "message": SKILL_MESSAGES.get(
                    skill,
                    f"{skill} started"
                ),
            }
        )

        try:

            # ----------------------------------
            # Get Skill Function
            # ----------------------------------

            skill_function = (
                SKILL_REGISTRY[skill]["function"]
            )

            # ----------------------------------
            # Execute Skill
            # ----------------------------------

            result = skill_function(
                state.prompt,
                state
            )

            # ----------------------------------
            # Save Result
            # ----------------------------------

            if result is not None:

                state.final_answer = result

            # ----------------------------------
            # Skill Completed
            # ----------------------------------

            event_bus.emit(
                "skill_end",
                {
                    "skill": skill,
                    "message": f"{skill} completed",
                }
            )

            print(
                f"✅ Skill {skill} executed."
            )

        except Exception as e:

            # ----------------------------------
            # Skill Error
            # ----------------------------------

            event_bus.emit(
                "error",
                {
                    "skill": skill,
                    "message": str(e),
                }
            )

            print(
                f"❌ Skill {skill} failed:",
                e
            )

            # Continue with other skills
            continue

    # ======================================
    # Return Updated State
    # ======================================

    return state