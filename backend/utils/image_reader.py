from PIL import Image

def read_image(path):
    """
    Load image using Pillow.
    Returns a PIL Image object.
    """
    return Image.open(path)