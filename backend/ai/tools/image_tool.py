from memory import get_images

def use_image(session_id, prompt):

    images = get_images(session_id)

    if not images:
        return None

    return images[-1]