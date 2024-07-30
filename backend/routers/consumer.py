from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from backend.models.consumer import ProductInfo
from backend.database import get_db_connection
import logging
from typing import List

router = APIRouter()
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
@router.get('/on_sell/{today_date}', response_model=List[ProductInfo])
async def get_on_sell_item(today_date: str, conn: Connection=Depends(get_db)):
    """
    Get agricultural product which off_shelf_date is larger than today_date

    Args:
        today_date(str):today date
        conn(Connection): The database connection.

    Returns:
        List[ProductInfo]: A list of agricultural product information.
    """
    cur = conn.cursor()
    try:
        logging.info("Get agricultural product.(today_date: %s)", today_date)
        cur.execute("SELECT * FROM agricultural_produce WHERE off_shelf_date >= %s", (today_date,))

        products = cur.fetchall()
        logging.info('start create product list')
        product_list:List[ProductInfo] = []
        for product in products:
            product_list.append({
                "id":product[0],
                "name":product[1],
                "price": str(product[2]),
                "totalQuantity": str(product[3]),
                "category": product[4],
                "uploadDate":str(product[5]),
                "offShelfDate":str(product[6]),
                "imgLink": product[7],
                "imgId": product[8],
                "sellerId": product[9],    
            })
        return product_list
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()



