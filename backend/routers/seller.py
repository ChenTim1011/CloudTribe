from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from backend.models.seller import UploadImageResponse, UploadImageRequset, UploadItemRequest, ProductBasicInfo
from backend.database import get_db_connection
from dotenv import load_dotenv
import os
import requests
import logging
import datetime
from typing import List

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

@router.post("/upload_image", response_model = UploadImageResponse)
async def upload_image(request: UploadImageRequset):
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
            return {"imgId": response_data["data"]["id"] , "imgLink": response_data["data"]["link"]}
    except Exception as e:
        logging.error("Error occurred during upload photo: %s", str(e))

@router.post('/')
async def upload_item(req: UploadItemRequest, conn: Connection = Depends(get_db)):
    """
    Upload item

    Args:
        Request(UploadItemRequest):The upload item information
        conn(Connection): The database connection.

    Returns:
        A success message.
    """
    cur = conn.cursor()
    try:
        logging.info("Inserting new item")
        cur.execute(
            """INSERT INTO agricultural_produce (name, price, total_quantity, category, upload_date, off_shelf_date, img_link, img_id, seller_id) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (req.name, req.price, req.totalQuantity, req.category, str(datetime.date.today()), req.offShelfDate, req.imgLink, req.imgId, req.sellerId)
        )
        conn.commit()
        return "item create successfully"
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get('/{sellerId}', response_model=List[ProductBasicInfo])
async def get_seller_item(sellerId: str, conn: Connection=Depends(get_db)):
    """
    Get Seller Product

    Args:
        phone(str):The Seller phone
        conn(Connection): The database connection.

    Returns:
        List[ProductBasicInfo]: A list of product basic information.
    """
    cur = conn.cursor()
    try:
        logging.info("Get user  whose id is %s uploaded product information.", sellerId)
        cur.execute("SELECT id, name, upload_date, off_shelf_date FROM agricultural_produce WHERE seller_id = %s", (sellerId,))

        products = cur.fetchall()
        logging.info('start create product list')
        product_list:List[ProductBasicInfo] = []
        for product in products:
            product_list.append({
                "id":product[0],
                "name":product[1],
                "uploadDate":str(product[2]),
                "offShelfDate":str(product[3]),
            })
        return product_list
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()




