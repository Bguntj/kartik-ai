from ai.embeddings import embed_text
from ai.vector_store import search_documents


# ==========================================
# RAG TOOL
# ==========================================

def use_rag(session_id, prompt):

    print("\n📚 RAG TOOL START")
    print("Session:", session_id)
    print("Prompt:", prompt)

    # ==========================================
    # Validate Prompt
    # ==========================================

    if not prompt or not prompt.strip():

        print("⚠ Empty RAG prompt")

        return ""


    # ==========================================
    # Create Embedding
    # ==========================================

    try:

        embedding = embed_text(prompt)

    except Exception as e:

        print("\n❌ RAG EMBEDDING ERROR")
        print(e)

        return ""


    # ==========================================
    # Search Vector Store
    # ==========================================

    try:

        chunks = search_documents(
            session_id,
            embedding,
            top_k=5
        )

    except Exception as e:

        print("\n❌ RAG SEARCH ERROR")
        print(e)

        return ""


    # ==========================================
    # No Results
    # ==========================================

    if not chunks:

        print("⚠ No relevant document chunks found")

        return ""


    # ==========================================
    # Clean Results
    # ==========================================

    valid_chunks = []

    for chunk in chunks:

        if chunk is None:
            continue

        chunk = str(chunk).strip()

        if not chunk:
            continue

        valid_chunks.append(chunk)


    if not valid_chunks:

        print("⚠ No valid document content found")

        return ""


    # ==========================================
    # Limit Results
    # ==========================================

    valid_chunks = valid_chunks[:5]


    # ==========================================
    # Build RAG Context
    # ==========================================

    context = "\n\n".join(
        valid_chunks
    )


    # ==========================================
    # Debug Output
    # ==========================================

    print(
        f"📄 RAG Chunks Found: {len(valid_chunks)}"
    )

    print(
        "\n========== RAG CONTEXT =========="
    )

    print(context)

    print(
        "=================================\n"
    )


    return context