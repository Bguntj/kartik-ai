from sentence_transformers import SentenceTransformer
import numpy as np


# ==========================================
# EMBEDDING MODEL
# ==========================================

MODEL_NAME = "all-MiniLM-L6-v2"

EMBEDDING_DIMENSION = 384


print(
    f"🧠 Loading embedding model: {MODEL_NAME}"
)

model = SentenceTransformer(
    MODEL_NAME
)

print(
    f"✅ Embedding model loaded "
    f"({EMBEDDING_DIMENSION} dimensions)"
)


# ==========================================
# CREATE EMBEDDING
# ==========================================

def embed_text(text):

    if not text:

        return np.zeros(
            EMBEDDING_DIMENSION,
            dtype=np.float32
        )


    text = str(text).strip()


    if not text:

        return np.zeros(
            EMBEDDING_DIMENSION,
            dtype=np.float32
        )


    embedding = model.encode(
        text,
        convert_to_numpy=True,
        normalize_embeddings=False
    )


    return np.asarray(
        embedding,
        dtype=np.float32
    )