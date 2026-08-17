from memory import get_document


def retrieve_document(session_id, question):
    """
    Future RAG Entry Point.

    Currently returns the full uploaded document.

    Later this function will:
        - Chunk documents
        - Search relevant chunks
        - Return only useful context
    """

    return get_document(session_id)