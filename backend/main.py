from fastapi import FastAPI, HTTPException, File, UploadFile, Request, Form
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import logging
from service.image_service import ImageService
from service.ai_service import AIService
from typing import List, Optional
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

image_service = ImageService()
ai_service = AIService()

@app.post("/api/v1/collage")
async def upload_plan_image_with_links(plan_img: UploadFile = File(...), links: Optional[str] = Form(None)):
    try:
        if not plan_img:
            logger.error("Bad request: empty plan image upload")
            raise HTTPException(
                status_code=400, detail="Bad request: empty plan image upload"
            )

        name_to_link = json.loads(links) if links else {}

        if not name_to_link:
            logger.error("Bad request: empty image urls")
            raise HTTPException(status_code=400, detail="Bad request: empty image urls")

        file_path = f"uploads/{plan_img.filename}"
        with open(file_path, "wb") as buffer:
            content = await plan_img.read()
            buffer.write(content)
            logger.info(f"Saved uploaded image: {file_path}")

        base64_images = image_service.get_base64_images(name_to_link)
        if not base64_images:
            logger.warning("No images found")
            raise HTTPException(status_code=404, detail="No images found")

        generated_collages = ai_service.get_generated_image(base64_images)

        return JSONResponse(content={"status": "success", "message": "Image uploaded and processed", "images": generated_collages})
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
