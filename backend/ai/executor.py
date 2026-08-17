from ai.agent_state import AgentState
from ai.tool_registry import TOOL_REGISTRY

from events.event_bus import event_bus


TOOL_MESSAGES = {

    "memory": "Reading Memory...",

    "rag": "Searching Documents...",

    "web": "Searching Internet...",

    "image": "Analyzing Image..."

}


def execute_tools(

    session_id,

    prompt,

    selected_tools

):

    state = AgentState()

    state.prompt = prompt

    for tool in selected_tools:

        if tool not in TOOL_REGISTRY:
            continue

        # -----------------------------
        # Tool Started
        # -----------------------------

        event_bus.emit(
            "tool_start",
            {
                "tool": tool,
                "message": TOOL_MESSAGES.get(tool, tool)
            }
        )

        try:

            result = TOOL_REGISTRY[tool](

                session_id,

                prompt

            )

            if tool == "memory":
                state.memory = result

            elif tool == "rag":
                state.rag = result

            elif tool == "web":
                state.web = result

            elif tool == "image":
                state.image = result

            state.add_observation(
                tool,
                result
            )

            # -----------------------------
            # Tool Finished
            # -----------------------------

            event_bus.emit(
                "tool_end",
                {
                    "tool": tool,
                    "message": f"{tool} completed"
                }
            )

            print(f"✅ {tool} executed.")

        except Exception as e:

            event_bus.emit(
                "error",
                {
                    "tool": tool,
                    "message": str(e)
                }
            )

            print(f"❌ {tool} failed:", e)

    return state