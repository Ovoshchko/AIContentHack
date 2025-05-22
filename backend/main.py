from fastapi import FastAPI, HTTPException, File, UploadFile, Request, Form
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import logging
from service.image_service import ImageService
from typing import List, Optional
import os
import json
from openai import OpenAI

app = FastAPI()

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

image_service = ImageService()

# openai = OpenAI(
#     # This is the default and can be omitted
#     api_key=os.environ.get("OPENAI_API_KEY"),
# )

# response = openai.responses.create(
#     model="gpt-4o",
#     instructions="You are a coding assistant that talks like a pirate.",
#     input="How do I check if a Python object is an instance of a class?",
# )
# print(response.output_text)


# @app.post("/api/v1/collage")
# async def get_images(name_to_link: dict = None):
#     try:
#         logger.info(f"Received request with data: {name_to_link}")
#         if not name_to_link:
#             logger.error("Bad request: empty image urls")
#             raise HTTPException(status_code=400, detail="Bad request: empty image urls")
#         base64_images = image_service.get_base64_images(name_to_link)
#         if not base64_images:
#             logger.warning("No images found")
#             raise HTTPException(status_code=404, detail="No images found")
#
#         logger.info("Successfully processed images")
#         return JSONResponse(content=base64_images)
#     except Exception as e:
#         logger.error(f"Error processing request: {str(e)}")
#         raise HTTPException(status_code=e.status_code or 500, detail=str(e))


@app.post("/api/v1/collage")
async def upload_plan_image_with_links(plan_img: UploadFile = File(...), links: Optional[str] = Form(None)):
    try:
        if not plan_img:
            logger.error("Bad request: empty plan image upload")
            raise HTTPException(
                status_code=400, detail="Bad request: empty plan image upload"
            )
        
        # Parse JSON string into Python dictionary
        name_to_link = json.loads(links) if links else {}
        
        if not name_to_link:
            logger.error("Bad request: empty image urls")
            raise HTTPException(status_code=400, detail="Bad request: empty image urls")
            
        # Save uploaded image
        file_path = f"uploads/{plan_img.filename}"
        with open(file_path, "wb") as buffer:
            content = await plan_img.read()
            buffer.write(content)
            logger.info(f"Saved uploaded image: {file_path}")
        
        # Process image with links
        base64_images = image_service.get_base64_images(name_to_link)
        if not base64_images:
            logger.warning("No images found")
            raise HTTPException(status_code=404, detail="No images found")
            
        logger.info(f"Successfully processed images. Total images returned: {len(base64_images)}")
        return JSONResponse(content={"status": "success", "message": "Image uploaded and processed", "images": base64_images})
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
