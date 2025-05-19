from parser.parser import ImageParser
import base64
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


class ImageService:
    def __init__(self):
        self.image_parser = ImageParser()

    def get_base64_images(self, name_to_link):
        try:
            name_to_image_dict = self.image_parser.get_name_to_image_dict(name_to_link)
            if not name_to_image_dict:
                return []

            base64_images = []
            for name, image in name_to_image_dict.items():
                image_byte_arr = BytesIO()
                image.save(image_byte_arr, format='PNG')
                image_byte_arr = image_byte_arr.getvalue()
                base64_image = base64.b64encode(image_byte_arr).decode('utf-8')
                base64_images.append(base64_image)

            logger.info("Successfully processed images")
            return base64_images
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            raise e