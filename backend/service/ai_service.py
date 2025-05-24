from openai import OpenAI
import base64
import io

client = OpenAI(
    api_key="",
)

prompt = """
Generate a photorealistic interior scene based on the provided floor plan layout. 
Use only the furniture items shown in the reference images. 
Arrange the furniture exactly according to the layout to create a coherent and realistic living space.
"""

def mock_image():
    output_filename = "result.png"

    with open(output_filename, "rb") as f:
        image_bytes = f.read()

    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    return [encoded_image]

class AIService:

    @staticmethod
    def __test_openai_client__():
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a coding assistant that talks like a pirate."},
                {"role": "user", "content": "How do I check if a Python object is an instance of a class?"}
            ]
        )

        print(response.choices[0].message.content)

    @staticmethod
    def get_generated_image(images_base64):

        print("OMG OMG")

        return mock_image()  # stub without token

        images_files = []

        for i, b64_img in enumerate(images_base64):
            img_bytes = base64.b64decode(b64_img)
            img_file = io.BytesIO(img_bytes)
            img_file.name = f"image_{i}.png"
            images_files.append(img_file)

        result = client.images.edit(
            model="gpt-image-1",
            image=images_files,
            prompt=prompt
        )

        image_base64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)

        output_filename = "collage.png"

        with open(output_filename, "wb") as f:
            f.write(image_bytes)

        for f in images_files:
            f.close()

        return [image_bytes]
