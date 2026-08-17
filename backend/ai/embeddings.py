from sentence_transformers import SentenceTransformer
import numpy as np


# ==========================================
# EMBEDDING MODEL
# ==========================================

MODEL_NAME = "all-MiniLM-L6-v2"

EMBEDDING_DIMENSION = 384

model = None


# ==========================================
# LAZY LOAD MODEL
# ==========================================

def get_model():

    global model

    if model is None:

        print(
            f"Loading embedding model: {MODEL_NAME}"
        )

        model = SentenceTransformer(
            MODEL_NAME,
            device="cpu"
        )

        print(
            f"Embedding model loaded "
            f"({EMBEDDING_DIMENSION} dimensions)"
        )

    return model


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

    embedding_model = get_model()

    embedding = embedding_model.encode(
        text,
        convert_to_numpy=True,
        normalize_embeddings=False
    )

    return np.asarray(
        embedding,
        dtype=np.float32
    )