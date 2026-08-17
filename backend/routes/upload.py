import shutil
from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
)

from document.pdf_reader import read_pdf
from document.docx_reader import read_docx

from memory import (
    save_document,
    save_image,
)

from ai.chunker import chunk_text
from ai.embeddings import embed_text
from ai.vector_store import add_document


router = APIRouter()


# ==========================================
# Upload Directory
# ==========================================

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    exist_ok=True
)


# ==========================================
# Upload Document
# ==========================================

@router.post("/upload/document")
async def upload_document(

    session_id: int = Form(...),

    file: UploadFile = File(...)

):

    filename = file.filename or "uploaded_file"

    extension = (
        filename
        .split(".")[-1]
        .lower()
    )


    # ==========================================
    # Save Uploaded File
    # ==========================================

    file_path = UPLOAD_DIR / filename


    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    # ==========================================
    # Extract Text
    # ==========================================

    text = ""


    try:

        if extension == "pdf":

            text = read_pdf(
                str(file_path)
            )


        elif extension == "docx":

            text = read_docx(
                str(file_path)
            )


        elif extension == "txt":

            text = file_path.read_text(
                encoding="utf-8",
                errors="ignore"
            )


        else:

            return {
                "success": False,
                "message": "Unsupported file."
            }


    except Exception as e:

        print(
            "❌ Document Read Error:",
            e
        )

        return {
            "success": False,
            "message": "Failed to read document.",
            "error": str(e)
        }


    # ==========================================
    # Validate Extracted Text
    # ==========================================

    text = text.strip()


    if not text:

        return {
            "success": False,
            "message": "No readable text found in document."
        }


    print(
        f"📄 Extracted Text: {len(text)} characters"
    )


    # ==========================================
    # Save Full Document
    # ==========================================

    try:

        save_document(

            session_id,

            Path(filename).stem,

            text

        )

        print(
            "✅ Full document saved"
        )


    except Exception as e:

        print(
            "❌ Document Save Error:",
            e
        )

        return {
            "success": False,
            "message": "Failed to save document.",
            "error": str(e)
        }


    # ==========================================
    # Build Vector Index
    # ==========================================

    chunks = []


    try:

        chunks = chunk_text(
            text
        )


        print(
            f"📄 Total Chunks: {len(chunks)}"
        )


        for i, chunk in enumerate(
            chunks,
            start=1
        ):

            if not chunk:
                continue


            chunk = str(chunk).strip()


            if not chunk:
                continue


            print(
                f"🧠 Embedding Chunk "
                f"{i}/{len(chunks)}"
            )


            embedding = embed_text(
                chunk
            )


            add_document(

                session_id,

                embedding,

                chunk

            )


        print(
            "✅ Vector Database Updated"
        )


    except Exception as e:

        print(
            "❌ Vector Index Error:",
            e
        )

        return {
            "success": False,
            "message": "Document saved, but vector indexing failed.",
            "chunks": len(chunks),
            "error": str(e)
        }


    # ==========================================
    # Success
    # ==========================================

    return {

        "success": True,

        "message":
            "Document uploaded and indexed successfully.",

        "filename":
            filename,

        "chunks":
            len(chunks)

    }


# ==========================================
# Upload Image
# ==========================================

@router.post("/upload/image")
async def upload_image(

    session_id: int = Form(...),

    file: UploadFile = File(...)

):

    filename = file.filename or "uploaded_image"

    file_path = UPLOAD_DIR / filename


    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        save_image(

            session_id,

            str(file_path)

        )


        print(
            f"🖼️ Image uploaded: {filename}"
        )


        return {

            "success": True,

            "message":
                "Image uploaded successfully.",

            "filename":
                filename

        }


    except Exception as e:

        print(
            "❌ Image Upload Error:",
            e
        )


        return {

            "success": False,

            "message":
                "Image upload failed.",

            "error":
                str(e)

        }