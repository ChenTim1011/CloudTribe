from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from backend.models.seller import UploadImageResponse, UploadImageRequset, UploadItemRequest, ProductBasicInfo, ProductInfo, ProductOrderInfo
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
            return {"img_id": response_data["data"]["id"] , "img_link": response_data["data"]["link"]}
    except Exception as e:
        logging.error("Error occurred during upload photo: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e

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
            (req.name, req.price, req.total_quantity, req.category, str(datetime.date.today()), req.off_shelf_date, req.img_link, req.img_id, req.seller_id)
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
async def get_seller_item(sellerId: int, conn: Connection=Depends(get_db)):
    """
    Get Seller Product

    Args:
        sellerId(str):The Seller phone
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
                "upload_date":str(product[2]),
                "off_shelf_date":str(product[3]),
            })
        return product_list
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get('/product/{productId}', response_model=ProductInfo)
async def get_product_info(productId: int, conn: Connection=Depends(get_db)):
    """
    Get Seller Product information

    Args:
        productId(str):The product id
        conn(Connection): The database connection.

    Returns:
        ProductInfo: Specific product information.
    """
    cur = conn.cursor()
    try:
        logging.info("Get item information with id is %s.", productId)
        cur.execute(
            """SELECT id, name, price, category, total_quantity, upload_date, off_shelf_date, img_link, img_id
            FROM agricultural_produce WHERE id = %s""", (productId,))
 
        product = cur.fetchone()
        _product = {
            "id":product[0],
            "name": product[1],
            "price": product[2],
            "category": product[3],
            "total_quantity": product[4],
            "upload_date":str(product[5]),
            "off_shelf_date": str(product[6]),
            "img_link": product[7],
            "img_id": product[8]
        }
        return _product
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()


@router.get('/product/order/{productId}', response_model=List[ProductOrderInfo])
async def get_product_order(productId: int, conn: Connection=Depends(get_db)):
    """
    Get orders of seller product

    Args:
        productId(str):The product id
        conn(Connection): The database connection.

    Returns:
        List[ProductOrderInfo]: A list of product order information.
    """
    cur = conn.cursor()
    try:
        logging.info("Get orders of item with id %s.", productId)
        cur.execute(
            """SELECT o.id, o.buyer_name, o.quantity, produce.price, o.status, o.timestamp
            FROM product_order as o
            JOIN agricultural_produce as produce ON o.produce_id=produce.id
            WHERE produce_id = %s  AND o.category = %s""", (productId, 'agriculture'))

        items = cur.fetchall()
        logging.info('start create product order list')
        item_order_list:List[ProductOrderInfo] = []
        for item in items:
            item_order_list.append({
                "order_id":item[0],
                "buyer_name":item[1],
                "quantity":item[2],
                "product_price":item[3],
                "status":item[4],
                "timestamp":str(item[5]),
            })
        return item_order_list
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

 




