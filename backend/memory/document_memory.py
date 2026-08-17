uploaded_documents = {}


def save_document(session_id, text):
    uploaded_documents[session_id] = text


def get_document(session_id):
    return uploaded_documents.get(session_id, "")