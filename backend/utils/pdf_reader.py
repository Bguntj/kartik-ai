from pypdf import PdfReader


def read_pdf(path):
    reader = PdfReader(path)

    text = ""

    print(f"Pages: {len(reader.pages)}")

    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()

        if page_text:
            print(f"Page {i + 1}: {len(page_text)} characters")
            text += page_text + "\n"
        else:
            print(f"Page {i + 1}: No text found")

    return text.strip()