from ai.router import should_search
from ai.web_search import web_search


# ==========================================
# WEB TOOL
# ==========================================

def use_web(session_id, prompt):

    print("\n🌐 WEB TOOL START")
    print("Prompt:", prompt)

    # ==========================================
    # Check Router
    # ==========================================

    should_use_web = should_search(prompt)

    print("Should Search:", should_use_web)

    if not should_use_web:

        print("⚠ Search skipped by router")

        return ""


    # ==========================================
    # Execute Web Search
    # ==========================================

    try:

        results = web_search(prompt)

    except Exception as e:

        print("❌ Web Search Error:", e)

        return ""


    # ==========================================
    # Raw Results
    # ==========================================

    print("Raw Results:")
    print(results)


    if not results:

        print("❌ No Web Results")

        return ""


    # ==========================================
    # Build Web Context
    # ==========================================

    context_parts = []

    seen = set()


    for item in results:

        if not isinstance(item, dict):

            continue


        title = str(
            item.get("title") or ""
        ).strip()

        body = str(
            item.get("body") or ""
        ).strip()

        link = str(
            item.get("link") or ""
        ).strip()


        # --------------------------------------
        # Skip Empty Results
        # --------------------------------------

        if not title and not body:

            continue


        # --------------------------------------
        # Remove Duplicate Results
        # --------------------------------------

        unique_key = (
            title.lower(),
            link.lower()
        )

        if unique_key in seen:

            continue

        seen.add(unique_key)


        # --------------------------------------
        # Add Result
        # --------------------------------------

        context_parts.append(
            f"Title: {title}\n"
            f"Summary: {body}\n"
            f"Source: {link}\n"
        )


    # ==========================================
    # No Valid Results
    # ==========================================

    if not context_parts:

        print("❌ No valid Web Results")

        return ""


    # ==========================================
    # Limit Context
    # ==========================================

    # Prevent unnecessarily huge prompts.

    context_parts = context_parts[:5]


    text = "\n".join(
        context_parts
    )


    # ==========================================
    # Final Web Context
    # ==========================================

    print(
        "\n========== WEB CONTEXT =========="
    )

    print(text)

    print(
        "=================================\n"
    )


    return text