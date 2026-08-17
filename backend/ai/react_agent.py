from events.event_bus import event_bus

from ai.planner_llm import plan_tools
from ai.executor import execute_tools
from ai.skill_executor import execute_skills
from ai.reflector import reflect


# ==========================================
# RUN AI AGENT
# ==========================================

def run_agent(session_id, prompt):

    # ======================================
    # Planning
    # ======================================

    event_bus.emit(
        "thinking",
        "Planning..."
    )

    plan = plan_tools(
        prompt,
        session_id
    )

    if not plan:
        plan = {
            "tools": [],
            "skills": []
        }

    tools = plan.get(
        "tools",
        []
    )

    skills = plan.get(
        "skills",
        []
    )

    print("\n🧠 Planner")

    print(
        "Tools :",
        tools
    )

    print(
        "Skills:",
        skills
    )

    # ======================================
    # Execute Tools
    # ======================================

    if tools:

        event_bus.emit(
            "thinking",
            "Executing tools..."
        )

        try:

            state = execute_tools(
                session_id,
                prompt,
                tools
            )

        except Exception as e:

            print(
                "❌ Tool Execution Error:",
                e
            )

            event_bus.emit(
                "error",
                f"Tool error: {e}"
            )

            # Continue with empty state
            state = execute_tools(
                session_id,
                prompt,
                []
            )

    else:

        # No tools required
        state = execute_tools(
            session_id,
            prompt,
            []
        )

    # ======================================
    # Execute Skills
    # ======================================

    if skills:

        event_bus.emit(
            "thinking",
            "Executing skills..."
        )

        try:

            state = execute_skills(
                state,
                skills
            )

        except Exception as e:

            print(
                "❌ Skill Execution Error:",
                e
            )

            event_bus.emit(
                "error",
                f"Skill error: {e}"
            )

    # ======================================
    # Reflection
    # ======================================

    event_bus.emit(
        "thinking",
        "Reflecting..."
    )

    try:

        state = reflect(
            state
        )

    except Exception as e:

        print(
            "❌ Reflection Error:",
            e
        )

        event_bus.emit(
            "error",
            f"Reflection error: {e}"
        )

    # ======================================
    # Finished
    # ======================================

    event_bus.emit(
        "done",
        "Finished"
    )

    return state