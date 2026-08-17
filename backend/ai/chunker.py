# ==========================================
# TEXT CHUNKER
# ==========================================

def chunk_text(
    text,
    size=600,
    overlap=100
):

    if not text:
        return []


    text = str(text).strip()


    if not text:
        return []


    # Prevent invalid values
    size = max(
        100,
        int(size)
    )

    overlap = max(
        0,
        min(
            int(overlap),
            size - 1
        )
    )


    chunks = []

    start = 0

    text_length = len(text)


    while start < text_length:

        end = min(
            start + size,
            text_length
        )


        chunk = text[
            start:end
        ].strip()


        if chunk:

            chunks.append(
                chunk
            )


        # Move forward while keeping overlap
        next_start = end - overlap


        if next_start <= start:

            break


        start = next_start


    return chunks