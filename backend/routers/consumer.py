from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from backend.models.consumer import ProductInfo, AddCartRequest, CartItem
from backend.database import get_db_connection
import logging
from typing import List
import datetime
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
@router.get('/', response_model=List[ProductInfo])
async def get_on_sell_item(conn: Connection=Depends(get_db)):
    """
    Get agricultural product which off_shelf_date is larger than today_date

    Args:
        today_date(str):today date
        conn(Connection): The database connection.

    Returns:
        List[ProductInfo]: A list of agricultural product information.
    """
    today = datetime.date.today()
    cur = conn.cursor()
    try:
        logging.info("Get agricultural product.(today_date: %s)", today)
        cur.execute("SELECT * FROM agricultural_produce WHERE off_shelf_date >= %s", (today,))
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
@router.post('/cart')
async def add_cart(req: AddCartRequest, conn: Connection = Depends(get_db)):
    """
    Add item to shopping cart

    Args:
        Request(AddCartRequest):The add item information
        conn(Connection): The database connection.

    Returns:
        itemId(int):The id of added item.
    """
    cur = conn.cursor()
    try:
        logging.info('check whether insert the same item')
        cur.execute(
            "SELECT produce_id FROM agricultural_shopping_cart WHERE produce_id = %s AND buyer_id = %s", 
            (req.produceId, req.buyerId, )
        )
        repeated_id = cur.fetchone()
        if repeated_id:
            raise HTTPException(status_code=409, detail="重複新增相同商品")
            
        logging.info("Inserting to cart")
        cur.execute(
            """INSERT INTO agricultural_shopping_cart (buyer_id, produce_id, quantity, status) 
            VALUES (%s, %s, %s, %s) RETURNING id""",
            (req.buyerId, req.produceId, req.quantity, '未接單')
        )
        itemId = cur.fetchone()[0]
        conn.commit()
        return itemId
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get('/cart/{userId}', response_model=List[CartItem])
async def get_seller_item(userId: str, conn: Connection=Depends(get_db)):
    """
    Get User cart items

    Args:
        userId(str):The user id
        conn(Connection): The database connection.

    Returns:
        List[ProductBasicInfo]: A list of cart items.
    """
    today = datetime.date.today()
    cur = conn.cursor()
    try:
        logging.info("Get cart items of user whose id is %s.", userId)
        cur.execute(
            """SELECT cart.id, produce.name, produce.img_link, produce.price, cart.quantity
            FROM agricultural_shopping_cart as cart
            JOIN agricultural_produce as produce ON cart.produce_id=produce.id
            WHERE buyer_id = %s AND produce.off_shelf_date >= %s AND cart.status= %s""", (userId, today, '未接單'))

        items = cur.fetchall()
        logging.info('start create product list')
        cart_list:List[CartItem] = []
        for item in items:
            cart_list.append({
                "id":item[0],
                "name":item[1],
                "imgUrl":item[2],
                "price":item[3],
                "quantity":item[4]
            })
        return cart_list
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()



