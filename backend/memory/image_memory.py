uploaded_images = {}


def save_image(session_id, image_path):
    uploaded_images[session_id] = image_path


def get_image(session_id):
    return uploaded_images.get(session_id)