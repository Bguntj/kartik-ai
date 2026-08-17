from ai.tools.memory_tool import use_memory
from ai.tools.rag_tool import use_rag
from ai.tools.web_tool import use_web
from ai.tools.image_tool import latest_image


def collect_tools(session_id, query):

    return {

        "memory": use_memory(session_id),

        "rag": use_rag(session_id, query),

        "web": use_web(query),

        "image": latest_image(session_id)

    }