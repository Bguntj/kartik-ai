from ai.tool_schemas import (
    MEMORY_SCHEMA,
    RAG_SCHEMA,
    WEB_SCHEMA,
    IMAGE_SCHEMA,
)

from ai.tools.memory_tool import use_memory
from ai.tools.rag_tool import use_rag
from ai.tools.web_tool import use_web
from ai.tools.image_tool import use_image


TOOLS = {

    "memory": {
        "schema": MEMORY_SCHEMA,
        "function": use_memory,
    },

    "rag": {
        "schema": RAG_SCHEMA,
        "function": use_rag,
    },

    "web": {
        "schema": WEB_SCHEMA,
        "function": use_web,
    },

    "image": {
        "schema": IMAGE_SCHEMA,
        "function": use_image,
    },

}


TOOL_REGISTRY = {
    name: tool["function"]
    for name, tool in TOOLS.items()
}