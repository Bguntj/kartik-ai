from enum import Enum


class EventType(str, Enum):

    THINKING = "thinking"

    TOOL_START = "tool_start"

    TOOL_END = "tool_end"

    SKILL_START = "skill_start"

    SKILL_END = "skill_end"

    REFLECTION = "reflection"

    TOKEN = "token"

    DONE = "done"

    ERROR = "error"