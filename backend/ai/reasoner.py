import json

from ai.llm_router import planner_llm


def reason(state):
    """
    ReAct Reasoning Step
    Returns:
    {
        "tool": "...",
        "skill": "...",
        "finish": bool
    }
    """

    prompt = f"""
You are the reasoning engine of Kartik AI.

Current User Question:
{state.prompt}

Previous Observations:
{state.observations}

Available Tools:
- memory
- rag
- web
- image

Available Skills:
- summarizer
- writer
- research
- coder
- maths
- translator

Rules:

1. If more information is needed,
choose ONE tool.

2. If enough information exists,
choose ONE skill.

3. If everything is finished,
return finish=true.

Return ONLY JSON.

Example 1

{{
"tool":"web",
"skill":"",
"finish":false
}}

Example 2

{{
"tool":"",
"skill":"research",
"finish":false
}}

Example 3

{{
"tool":"",
"skill":"",
"finish":true
}}
"""

    try:

        response = planner_llm(prompt)

        print("\n========== REASONER ==========")
        print(response)
        print("==============================")

        data = json.loads(response)

        return {
            "tool": data.get("tool", ""),
            "skill": data.get("skill", ""),
            "finish": data.get("finish", False),
        }

    except Exception as e:

        print("Reason Error:", e)

        return {
            "tool": "",
            "skill": "",
            "finish": True,
        }