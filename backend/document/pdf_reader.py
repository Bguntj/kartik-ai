import fitz  # PyMuPDF


def read_pdf(file_path):

    text = ""

    doc = fitz.open(file_path)

    for page in doc:

        page_text = page.get_text()

        if page_text:
            text += page_text + "\n"

    doc.close()

    return text