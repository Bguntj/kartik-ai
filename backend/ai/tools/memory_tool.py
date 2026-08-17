from ai.memory_retriever import build_memory_context

def use_memory(session_id, prompt):
    return build_memory_context(session_id)