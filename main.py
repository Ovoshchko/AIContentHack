from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import logging
from service.image_service import ImageService

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

image_service = ImageService()

@app.post("/api/v1/collage")
async def get_images(name_to_link: dict):
    try:
        logger.info(f"Received request with data: {name_to_link}")
        base64_images = image_service.get_base64_images(name_to_link)
        if not base64_images:
            logger.warning("No images found")
            raise HTTPException(status_code=404, detail="No images found")

        logger.info("Successfully processed images")
        return JSONResponse(content=base64_images)
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)