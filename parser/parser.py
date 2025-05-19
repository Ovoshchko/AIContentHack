from bs4 import BeautifulSoup
from PIL import Image
import requests
import io


class ImageParser:

    def get_name_to_image_dict(self, name_to_link_dict):
        return {name: self.extract_image(link) for name, link in name_to_link_dict.items()}

    def extract_image(self, link):
        page_content = self.get_page_content(link).text

        image_link = self.get_image_links_from_html(page_content)[1]

        return self.download_image(image_link)

    @staticmethod
    def download_image(link):
        response = ImageParser.get_page_content(link)
        return Image.open(io.BytesIO(response.content))

    @staticmethod
    def get_page_content(link):
        return requests.get(link, stream=True, verify=False)

    @staticmethod
    def get_image_links_from_html(html_content, image_format: str = '.jpg'):
        soup = BeautifulSoup(html_content, 'html.parser')

        img_source = [x['src'] for x in soup.find_all("img")]

        return [x for x in img_source if x.startswith('https://') & x.endswith(image_format)]
