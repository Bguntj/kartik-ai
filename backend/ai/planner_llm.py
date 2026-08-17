import json
import re

from ai.llm_router import planner_llm
from ai.tool_registry import TOOLS
from ai.skill_registry import SKILLS

from memory import get_documents


# =========================================================
# Direct Router Keywords
# =========================================================

MEMORY_KEYWORDS = [
    "remember",
    "memory",
    "my name",
    "who am i",
    "what is my name",
    "what do you know about me",
]

RAG_KEYWORDS = [
    "pdf",
    "document",
    "uploaded file",
    "file",
    "according to the document",
    "from the document",
    "in the document",
]

WEB_KEYWORDS = [
    "latest",
    "today",
    "news",
    "weather",
    "current",
    "live",
    "price",
    "stock",
    "bitcoin",
    "ipl",
    "cricket",
    "football",
    "recent",
]

IMAGE_KEYWORDS = [
    "image",
    "photo",
    "picture",
    "screenshot",
    "uploaded image",
]

WRITER_KEYWORDS = [
    "write",
    "email",
    "story",
    "article",
    "essay",
    "letter",
]

SUMMARIZER_KEYWORDS = [
    "summarize",
    "summary",
    "short summary",
]

CODER_KEYWORDS = [
    "code",
    "python",
    "javascript",
    "java",
    "html",
    "css",
    "react",
    "bug",
    "program",
    "programming",
    "function",
    "api",
    "error",
]

MATH_KEYWORDS = [
    "calculate",
    "solve",
    "math",
    "equation",
    "percentage",
    "percent",
]

TRANSLATOR_KEYWORDS = [
    "translate",
    "translation",
]


# =========================================================
# Generic Document Questions
# =========================================================

DOCUMENT_CONTEXT_KEYWORDS = [
    "explain",
    "summarize",
    "summary",
    "describe",
    "details",
    "detail",
    "elaborate",
    "tell me about",
    "what is this",
    "what are these",
    "what does this mean",
    "what does it mean",
    "give me an overview",
    "overview",
    "analyze",
    "analysis",
]


# =========================================================
# Helpers
# =========================================================

def contains_keyword(query, keywords):

    query = str(query or "").lower().strip()

    for keyword in keywords:

        if keyword in query:
            return True

    return False


def clean_result(tools, skills):

    valid_tools = []
    valid_skills = []

    for tool in tools:

        tool = str(tool).lower().strip()

        if (
            tool in TOOLS
            and tool not in valid_tools
        ):
            valid_tools.append(tool)

    for skill in skills:

        skill = str(skill).lower().strip()

        if (
            skill in SKILLS
            and skill not in valid_skills
        ):
            valid_skills.append(skill)

    return {
        "tools": valid_tools,
        "skills": valid_skills,
    }


def has_uploaded_documents(session_id):

    if session_id is None:
        return False

    try:

        documents = get_documents(
            session_id
        )

        return bool(documents)

    except Exception as e:

        print(
            "⚠️ Document detection error:",
            e
        )

        return False


def is_generic_document_question(prompt):

    return contains_keyword(
        prompt,
        DOCUMENT_CONTEXT_KEYWORDS
    )


# =========================================================
# Build Multi-Step Plan
# =========================================================

def build_steps(
    prompt,
    tools,
    skills
):

    steps = []
    step_number = 1

    # -----------------------------------------------------
    # Tool steps
    # -----------------------------------------------------

    for tool in tools:

        if tool == "memory":

            action = (
                "Retrieve relevant user memory "
                "for the current question."
            )

        elif tool == "rag":

            action = (
                "Search the uploaded documents "
                "for relevant information."
            )

        elif tool == "web":

            action = (
                "Retrieve relevant external "
                "information."
            )

        elif tool == "image":

            action = (
                "Analyze the uploaded image "
                "in relation to the user's question."
            )

        else:

            action = (
                f"Execute the {tool} tool."
            )

        steps.append({
            "step": step_number,
            "action": action,
            "type": "tool",
            "name": tool,
        })

        step_number += 1


    # -----------------------------------------------------
    # Skill steps
    # -----------------------------------------------------

    for skill in skills:

        steps.append({
            "step": step_number,
            "action": (
                f"Execute the {skill} skill "
                "using the available information."
            ),
            "type": "skill",
            "name": skill,
        })

        step_number += 1


    # -----------------------------------------------------
    # Final answer
    # -----------------------------------------------------

    steps.append({
        "step": step_number,
        "action": (
            "Use the collected information to "
            "prepare the final answer to the "
            "original user prompt."
        ),
        "type": "answer",
        "name": "final_answer",
    })


    return steps


# =========================================================
# Direct Local Planner
# =========================================================

def local_plan(
    prompt,
    session_id=None
):

    q = str(
        prompt or ""
    ).lower().strip()

    tools = []
    skills = []


    # ==========================================
    # Memory
    # ==========================================

    if contains_keyword(
        q,
        MEMORY_KEYWORDS
    ):

        if "memory" in TOOLS:

            tools.append("memory")


    # ==========================================
    # RAG
    # ==========================================

    if contains_keyword(
        q,
        RAG_KEYWORDS
    ):

        if "rag" in TOOLS:

            tools.append("rag")


    elif (
        has_uploaded_documents(session_id)
        and is_generic_document_question(q)
    ):

        if "rag" in TOOLS:

            tools.append("rag")

            print(
                "📄 Uploaded document detected."
            )

            print(
                "📚 Generic question routed to RAG."
            )


    # ==========================================
    # Web
    # ==========================================

    if contains_keyword(
        q,
        WEB_KEYWORDS
    ):

        if "web" in TOOLS:

            tools.append("web")

        if "research" in SKILLS:

            skills.append("research")


    # ==========================================
    # Image
    # ==========================================

    if contains_keyword(
        q,
        IMAGE_KEYWORDS
    ):

        if "image" in TOOLS:

            tools.append("image")


    # ==========================================
    # Writer
    # ==========================================

    if contains_keyword(
        q,
        WRITER_KEYWORDS
    ):

        if "writer" in SKILLS:

            skills.append("writer")


    # ==========================================
    # Summarizer
    # ==========================================

    if contains_keyword(
        q,
        SUMMARIZER_KEYWORDS
    ):

        if "summarizer" in SKILLS:

            skills.append("summarizer")


    # ==========================================
    # Coder
    # ==========================================

    if contains_keyword(
        q,
        CODER_KEYWORDS
    ):

        if "coder" in SKILLS:

            skills.append("coder")


    # ==========================================
    # Maths
    # ==========================================

    if contains_keyword(
        q,
        MATH_KEYWORDS
    ):

        if "maths" in SKILLS:

            skills.append("maths")


    # ==========================================
    # Translator
    # ==========================================

    if contains_keyword(
        q,
        TRANSLATOR_KEYWORDS
    ):

        if "translator" in SKILLS:

            skills.append("translator")


    result = clean_result(
        tools,
        skills
    )


    result["steps"] = build_steps(
        prompt,
        result["tools"],
        result["skills"]
    )


    return result


# =========================================================
# Gemini Planner Required?
# =========================================================

def needs_llm_planner(
    prompt,
    session_id=None
):

    q = str(
        prompt or ""
    ).lower().strip()

    if not q:
        return False


    direct_result = local_plan(
        q,
        session_id
    )


    if (
        direct_result["tools"]
        or direct_result["skills"]
    ):

        return False


    simple_patterns = [

        r"^what is .+",
        r"^what are .+",
        r"^who is .+",
        r"^who are .+",
        r"^where is .+",
        r"^when is .+",
        r"^why is .+",
        r"^how does .+ work",
        r"^define .+",
        r"^tell me about .+",
        r"^explain .+",

    ]


    for pattern in simple_patterns:

        if re.search(
            pattern,
            q
        ):

            return False


    return True


# =========================================================
# Gemini Planner
# =========================================================

def llm_plan(prompt):

    tool_list = "\n".join(

        f"- {name}: "
        f"{tool['schema']['description']}"

        for name, tool in TOOLS.items()

    )


    skill_list = "\n".join(

        f"- {name}: "
        f"{skill['description']}"

        for name, skill in SKILLS.items()

    )


    planner_prompt = f"""
You are an AI Planner.

Create a plan for the user's request.

Available Tools:
{tool_list}

Available Skills:
{skill_list}

Rules:

1. Choose only the minimum required tools.
2. Choose only the minimum required skills.
3. Use RAG when uploaded documents are relevant.
4. Use image when an uploaded image is relevant.
5. Use memory when user memory is relevant.
6. Use web only when external/current information is required.
7. Preserve the original user request.
8. Return JSON only.
9. Do not explain the JSON.
10. Do not use markdown.

Required JSON format:

{{
    "steps": [
        {{
            "step": 1,
            "action": "..."
        }}
    ],
    "tools": [],
    "skills": []
}}

User Question:

{prompt}
"""


    try:

        response = planner_llm(
            planner_prompt
        )


        print(
            "\n========== RAW PLANNER RESPONSE =========="
        )

        print(response)

        print(
            "=========================================="
        )


        if not response:

            return {
                "steps": [],
                "tools": [],
                "skills": [],
            }


        response = response.strip()

        response = response.replace(
            "```json",
            ""
        )

        response = response.replace(
            "```",
            ""
        )

        response = response.strip()


        start = response.find("{")
        end = response.rfind("}")


        if (
            start == -1
            or end == -1
            or end <= start
        ):

            return {
                "steps": [],
                "tools": [],
                "skills": [],
            }


        data = json.loads(
            response[
                start:end + 1
            ]
        )


        result = clean_result(

            data.get(
                "tools",
                []
            ),

            data.get(
                "skills",
                []
            )

        )


        # Keep planner-generated steps
        steps = data.get(
            "steps",
            []
        )


        if not isinstance(
            steps,
            list
        ):

            steps = []


        result["steps"] = steps


        # If Gemini didn't provide steps,
        # build safe steps locally.
        if not result["steps"]:

            result["steps"] = build_steps(

                prompt,

                result["tools"],

                result["skills"]

            )


        return result


    except Exception as e:

        print(
            "❌ Planner LLM Error:",
            e
        )


    return {
        "steps": [],
        "tools": [],
        "skills": [],
    }


# =========================================================
# MAIN PLANNER
# =========================================================

def plan_tools(
    prompt,
    session_id=None
):

    print(
        "\n========== PLANNER =========="
    )

    print(
        "Prompt:",
        prompt
    )

    print(
        "Session:",
        session_id
    )


    # ==========================================
    # Local Planner
    # ==========================================

    local_result = local_plan(
        prompt,
        session_id
    )


    # ==========================================
    # Direct Local Decision
    # ==========================================

    if (
        local_result["tools"]
        or local_result["skills"]
    ):

        print(
            "⚡ Local Planner Used"
        )

        print(
            "Tools:",
            local_result["tools"]
        )

        print(
            "Skills:",
            local_result["skills"]
        )

        print(
            "Steps:"
        )

        for step in local_result["steps"]:

            print(
                f"  {step.get('step')}. "
                f"{step.get('action')}"
            )


        print(
            "============================\n"
        )

        return local_result


    # ==========================================
    # Simple Question
    # ==========================================

    if not needs_llm_planner(
        prompt,
        session_id
    ):

        result = {
            "steps": build_steps(
                prompt,
                [],
                []
            ),
            "tools": [],
            "skills": [],
        }


        print(
            "⚡ Simple Question"
        )

        print(
            "Gemini Planner skipped"
        )

        print(
            "Tools: []"
        )

        print(
            "Skills: []"
        )

        print(
            "Steps:"
        )

        for step in result["steps"]:

            print(
                f"  {step['step']}. "
                f"{step['action']}"
            )


        print(
            "============================\n"
        )

        return result


    # ==========================================
    # Gemini Planner
    # ==========================================

    print(
        "🧠 Gemini Planner Required"
    )


    result = llm_plan(
        prompt
    )


    print(
        "Final Tools:",
        result["tools"]
    )

    print(
        "Final Skills:",
        result["skills"]
    )

    print(
        "Final Steps:"
    )

    for step in result["steps"]:

        print(
            f"  {step.get('step')}. "
            f"{step.get('action')}"
        )


    print(
        "============================\n"
    )


    return result