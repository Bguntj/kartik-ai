from memory import get_memory


def build_memory_context(session_id: int):

    memories = get_memory(session_id)

    if not memories:
        return ""

    context = "========== USER MEMORY ==========\n"

    for memory in memories:

        context += f"{memory.key}: {memory.value}\n"

    context += "===============================\n"

    return context