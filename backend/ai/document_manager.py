from memory import get_documents


# ==========================================
# DOCUMENT MANAGER
# ==========================================

def build_document_context(session_id):

    if not session_id:
        return ""


    # ==========================================
    # Load Documents
    # ==========================================

    try:

        docs = get_documents(
            session_id
        )

    except Exception as e:

        print(
            "❌ Document Manager Error:",
            e
        )

        return ""


    # ==========================================
    # No Documents
    # ==========================================

    if not docs:

        print(
            "📄 No documents found "
            f"for session {session_id}"
        )

        return ""


    # ==========================================
    # Build Context
    # ==========================================

    context_parts = []


    for i, doc in enumerate(
        docs,
        start=1
    ):

        if doc is None:
            continue


        doc = str(doc).strip()


        if not doc:
            continue


        context_parts.append(
            f"""
========== DOCUMENT {i} ==========

{doc}

===================================
"""
        )


    # ==========================================
    # No Valid Documents
    # ==========================================

    if not context_parts:

        return ""


    context = "\n".join(
        context_parts
    )


    # ==========================================
    # Debug
    # ==========================================

    print(
        f"📄 Loaded {len(context_parts)} "
        f"document(s) for session {session_id}"
    )


    return context