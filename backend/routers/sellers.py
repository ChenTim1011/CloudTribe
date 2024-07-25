from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from pydantic import BaseModel
from backend.models.models import Image
from backend.database import get_db_connection
from dotenv import load_dotenv
import os
import requests
import logging

class UploadPhotoRequset(BaseModel):
    img: str

router = APIRouter()
load_dotenv()

def get_db():
    """
    Get a database connection.
    
    Yields:
        psycopg2.extensions.connection: A PostgreSQL database connection.
    """
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

@router.post("/upload_image", response_model = Image)
async def upload_image(request: UploadPhotoRequset, conn: Connection = Depends(get_db)):
    """
    Upload photo which is base 64 data

    Args:
        Request(UploadPhotoRequest):The Photo which is base 64 data
        conn(Connection): The database connection.

    Returns:
        dict: The image data.
    """

    accessToken = os.environ.get('IMGUR_ACCESS_TOKEN')
    albumId = os.environ.get('IMGUR_ALBUM_ID')
    url = "https://api.imgur.com/3/image"
    headers = {"Authorization": f"Bearer {accessToken}"}
    img = request.img

    # Upload image to Imgur and get URL
    try:
        response = requests.post(url, headers=headers, data={'image': img, 'album': albumId})
        print('response:', response)
        response_data = response.json()
        if response_data["success"] is True:
            return{"imgId": response_data["data"]["id"] , "imgLink": response_data["data"]["link"]}
    except Exception as e:
        logging.error("Error occurred during upload photo: %s", str(e))

