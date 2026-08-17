from ai.skills.summarizer import summarize
from ai.skills.writer import write_text
from ai.skills.researcher import research
from ai.skills.coder import generate_code
from ai.skills.maths import solve_math
from ai.skills.translator import translate


SKILLS = {

    "summarizer": {
        "name": "summarizer",
        "description": "Summarize long documents and text.",
        "function": summarize,
    },

    "writer": {
        "name": "writer",
        "description": "Write articles, emails, stories and other content.",
        "function": write_text,
    },

    "research": {
        "name": "research",
        "description": "Analyze and organize collected information.",
        "function": research,
    },

    "coder": {
        "name": "coder",
        "description": "Generate or explain programming code.",
        "function": generate_code,
    },

    "maths": {
        "name": "maths",
        "description": "Solve mathematical problems.",
        "function": solve_math,
    },

    "translator": {
        "name": "translator",
        "description": "Translate text into another language.",
        "function": translate,
    },

}