from typing import List
from parser.parser import ImageParser
import base64
from io import BytesIO
import logging
import os

logger = logging.getLogger(__name__)


class ImageService:
    def __init__(self):
        self.image_parser = ImageParser()

    def get_base64_images(self, name_to_link) -> List[str]:
        try:
            name_to_image_dict = self.image_parser.get_name_to_image_dict(name_to_link)
            if not name_to_image_dict:
                return []

            base64_images = []
            for name, image in name_to_image_dict.items():
                image_byte_arr = BytesIO()
                image.save(image_byte_arr, format="PNG")
                image_byte_arr = image_byte_arr.getvalue()
                base64_image = base64.b64encode(image_byte_arr).decode("utf-8")
                base64_images.append(base64_image)
            
            # Always include result.jpg in the response
            try:
                result_path = "/Users/m/dev/hack/backend/result.jpg"
                if not os.path.exists(result_path):
                    logger.warning(f"result.jpg not found at {result_path}")
                else:
                    with open(result_path, "rb") as img_file:
                        result_image = base64.b64encode(img_file.read()).decode("utf-8")
                        base64_images.append(result_image)
                        logger.info(f"Successfully added result.jpg to the response. Images count: {len(base64_images)}")
            except Exception as e:
                logger.error(f"Error adding result.jpg to response: {str(e)}")

            logger.info("Successfully processed images")
            return base64_images
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            raise e
