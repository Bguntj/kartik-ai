import os
import pickle

import faiss
import numpy as np


# ==========================================
# VECTOR DATABASE
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

VECTOR_DIR = os.path.join(
    BASE_DIR,
    "vector_db"
)

INDEX_FILE = os.path.join(
    VECTOR_DIR,
    "index.faiss"
)

META_FILE = os.path.join(
    VECTOR_DIR,
    "metadata.pkl"
)

DIMENSION = 384


os.makedirs(
    VECTOR_DIR,
    exist_ok=True
)


# ==========================================
# CREATE EMPTY INDEX
# ==========================================

def create_index():

    return faiss.IndexFlatL2(
        DIMENSION
    )


# ==========================================
# LOAD / CREATE FAISS INDEX
# ==========================================

index = create_index()


if (
    os.path.exists(INDEX_FILE)
    and os.path.getsize(INDEX_FILE) > 0
):

    try:

        index = faiss.read_index(
            INDEX_FILE
        )

        print(
            f"✅ Loaded FAISS Index "
            f"({index.ntotal} vectors)"
        )

    except Exception as e:

        print(
            "⚠️ Failed to load FAISS index:",
            e
        )

        index = create_index()

else:

    print(
        "ℹ️ Created new FAISS Index"
    )


# ==========================================
# LOAD METADATA
# ==========================================

metadata = []


if (
    os.path.exists(META_FILE)
    and os.path.getsize(META_FILE) > 0
):

    try:

        with open(
            META_FILE,
            "rb"
        ) as f:

            metadata = pickle.load(
                f
            )

        if not isinstance(
            metadata,
            list
        ):

            print(
                "⚠️ Metadata format invalid"
            )

            metadata = []


        print(
            f"✅ Loaded Metadata "
            f"({len(metadata)} chunks)"
        )


    except Exception as e:

        print(
            "⚠️ Failed to load metadata:",
            e
        )

        metadata = []


# ==========================================
# VALIDATE INDEX / METADATA
# ==========================================

if index.ntotal != len(metadata):

    print(
        "⚠️ WARNING: FAISS index and "
        "metadata count do not match."
    )

    print(
        f"FAISS vectors: {index.ntotal}"
    )

    print(
        f"Metadata items: {len(metadata)}"
    )


# ==========================================
# SAVE INDEX
# ==========================================

def save_index():

    try:

        faiss.write_index(
            index,
            INDEX_FILE
        )


        with open(
            META_FILE,
            "wb"
        ) as f:

            pickle.dump(
                metadata,
                f
            )


        print(
            "💾 Vector database saved"
        )


    except Exception as e:

        print(
            "❌ Failed to save vector database:",
            e
        )

        raise


# ==========================================
# ADD DOCUMENT CHUNK
# ==========================================

def add_document(
    session_id,
    embedding,
    text
):

    if text is None:

        return


    text = str(
        text
    ).strip()


    if not text:

        return


    # --------------------------------------
    # Convert embedding
    # --------------------------------------

    vector = np.asarray(
        embedding,
        dtype=np.float32
    )


    # --------------------------------------
    # Flatten
    # --------------------------------------

    if vector.ndim != 1:

        vector = vector.flatten()


    # --------------------------------------
    # Validate dimension
    # --------------------------------------

    if len(vector) != DIMENSION:

        raise ValueError(
            f"Invalid embedding dimension: "
            f"{len(vector)}. "
            f"Expected {DIMENSION}."
        )


    # --------------------------------------
    # Validate NaN / Infinity
    # --------------------------------------

    if not np.all(
        np.isfinite(vector)
    ):

        raise ValueError(
            "Embedding contains "
            "NaN or Infinity values."
        )


    # --------------------------------------
    # Add vector to FAISS
    # --------------------------------------

    index.add(
        vector.reshape(
            1,
            DIMENSION
        )
    )


    # --------------------------------------
    # Add metadata
    # --------------------------------------

    metadata.append({

        "session_id": str(
            session_id
        ),

        "text": text

    })


    # --------------------------------------
    # Save
    # --------------------------------------

    save_index()


    print(
        f"✅ Added vector "
        f"(Total: {index.ntotal})"
    )


# ==========================================
# SEMANTIC SEARCH
# ==========================================

def search_documents(
    session_id,
    embedding,
    top_k=5
):

    # --------------------------------------
    # Empty database
    # --------------------------------------

    if index.ntotal == 0:

        print(
            "⚠️ FAISS Index Empty"
        )

        return []


    # --------------------------------------
    # Empty metadata
    # --------------------------------------

    if not metadata:

        print(
            "⚠️ Metadata Empty"
        )

        return []


    # --------------------------------------
    # Prevent invalid top_k
    # --------------------------------------

    top_k = max(
        1,
        int(top_k)
    )


    # --------------------------------------
    # Convert query embedding
    # --------------------------------------

    vector = np.asarray(
        embedding,
        dtype=np.float32
    )


    if vector.ndim != 1:

        vector = vector.flatten()


    # --------------------------------------
    # Validate dimension
    # --------------------------------------

    if len(vector) != DIMENSION:

        print(
            "❌ Invalid query embedding dimension:",
            len(vector)
        )

        return []


    # --------------------------------------
    # Validate values
    # --------------------------------------

    if not np.all(
        np.isfinite(vector)
    ):

        print(
            "❌ Query embedding contains "
            "invalid values"
        )

        return []


    vector = vector.reshape(
        1,
        DIMENSION
    )


    # ======================================
    # SEARCH FAISS
    # ======================================

    # Search more candidates because
    # we filter by session afterwards.

    search_count = min(
        max(
            top_k * 5,
            top_k
        ),
        index.ntotal
    )


    distances, indices = index.search(
        vector,
        search_count
    )


    print(
        "\n========== VECTOR SEARCH =========="
    )

    print(
        "Current Session:",
        session_id
    )

    print(
        "Total Vectors:",
        index.ntotal
    )

    print(
        "Metadata:",
        len(metadata)
    )

    print(
        "Requested Results:",
        top_k
    )

    print(
        "Search Candidates:",
        search_count
    )

    print(
        "==================================="
    )


    # ======================================
    # SESSION FILTER
    # ======================================

    results = []


    for rank, idx in enumerate(
        indices[0]
    ):

        if idx == -1:

            continue


        # ----------------------------------
        # Metadata safety
        # ----------------------------------

        if idx >= len(metadata):

            print(
                f"⚠️ Invalid metadata index: {idx}"
            )

            continue


        item = metadata[idx]


        if not isinstance(
            item,
            dict
        ):

            print(
                f"⚠️ Invalid metadata item: {idx}"
            )

            continue


        item_session = str(
            item.get(
                "session_id",
                ""
            )
        )


        item_text = str(
            item.get(
                "text",
                ""
            )
        ).strip()


        distance = float(
            distances[0][rank]
        )


        print(
            f"IDX={idx} | "
            f"SESSION={item_session} | "
            f"DISTANCE={distance:.4f}"
        )


        # ----------------------------------
        # Session match
        # ----------------------------------

        if (
            item_session
            != str(session_id)
        ):

            continue


        if not item_text:

            continue


        # ----------------------------------
        # Add result
        # ----------------------------------

        results.append(
            item_text
        )


        print(
            "✅ MATCH FOUND"
        )


        # ----------------------------------
        # Enough results
        # ----------------------------------

        if len(results) >= top_k:

            break


    print(
        "Matched Results:",
        len(results)
    )

    print(
        "===================================\n"
    )


    return results


# ==========================================
# GET VECTOR COUNT
# ==========================================

def get_vector_count():

    return index.ntotal


# ==========================================
# GET SESSION VECTOR COUNT
# ==========================================

def get_session_vector_count(
    session_id
):

    count = 0


    for item in metadata:

        if not isinstance(
            item,
            dict
        ):

            continue


        if str(
            item.get(
                "session_id",
                ""
            )
        ) == str(session_id):

            count += 1


    return count