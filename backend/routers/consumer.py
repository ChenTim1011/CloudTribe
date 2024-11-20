'''
Endpoints:
- POST /: Create a new driver
- POST /cart: Add item to shopping cart
- POST /order: Add agricultural item order //may change later to add necessity
- GET /: Get on sell items
- GET /cart/{userId}:  Get user shopping cart items 
- PATCH /cart/quantity/{itemId}: Update quantity of item with id {itemId}
- PATCH /cart/status/{itemId}: Update status to '已送單' with id {itemId}
- DELETE /cart/{itemId}: Delete specific item in shopping cart

'''
from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from backend.models.consumer import ProductInfo, AddCartRequest, CartItem, UpdateCartQuantityRequest, PurchaseProductRequest, PurchasedProduct
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
    Get agricultural_product which off_shelf_date is larger than today_date

    Args:
        today_date(str):today date
        conn(Connection): The database connection.

    Returns:
        List[ProductInfo]: A list of agricultural_product information.
    """
    today = datetime.date.today()
    cur = conn.cursor()
    try:
        logging.info("Get agricultural_product.(today_date: %s)", today)
        cur.execute("SELECT * FROM agricultural_produce WHERE off_shelf_date >= %s", (today,))
        products = cur.fetchall()
        logging.info('start create product list')
        product_list:List[ProductInfo] = []
        for product in products:
            product_list.append({
                "id":product[0],
                "name":product[1],
                "price": str(product[2]),
                "total_quantity": str(product[3]),
                "category": product[4],
                "upload_date":str(product[5]),
                "off_shelf_date":str(product[6]),
                "img_link": product[7],
                "img_id": product[8],
                "seller_id": product[9],
                "unit": product[10],   
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
            "SELECT produce_id FROM agricultural_shopping_cart WHERE produce_id = %s AND buyer_id = %s AND status = %s", 
            (req.produce_id, req.buyer_id, '未送單')
        )
        repeated_id = cur.fetchone()
        if repeated_id:
            raise HTTPException(status_code=409, detail="重複新增相同商品")
            
        logging.info("Inserting to cart")
        cur.execute(
            """INSERT INTO agricultural_shopping_cart (buyer_id, produce_id, quantity, status) 
            VALUES (%s, %s, %s, %s) RETURNING id""",
            (req.buyer_id, req.produce_id, req.quantity, '未送單')
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
async def get_seller_item(userId: int, conn: Connection=Depends(get_db)):
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
            """SELECT cart.id, produce.id, produce.name, produce.img_link, produce.price, cart.quantity, produce.seller_id, produce.unit
            FROM agricultural_shopping_cart as cart
            JOIN agricultural_produce as produce ON cart.produce_id=produce.id
            WHERE buyer_id = %s AND produce.off_shelf_date >= %s AND cart.status = %s""", (userId, today, '未送單'))

        items = cur.fetchall()
        logging.info('start create product list')
        cart_list:List[CartItem] = []
        for item in items:
            cart_list.append({
                "id":item[0],
                "produce_id":item[1],
                "name":item[2],
                "img_url":item[3],
                "price":item[4],
                "quantity":item[5],
                "seller_id":item[6],
                "unit": item[7],
            })
        return cart_list
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.delete('/cart/{itemId}')
async def delete_cart_item(itemId: int, conn: Connection=Depends(get_db)):
    """
    Delete cart item

    Args:
        itemId(int):The item id
        conn(Connection): The database connection.

    Returns:
        Dict: Success message.
    """
    cur = conn.cursor()
    try:
        logging.info("Delete cart item with id %s.", itemId)
        cur.execute(
            """DELETE FROM agricultural_shopping_cart
            WHERE id = %s""", (itemId, ))
        conn.commit()
        return {"success":"delete"}
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()
@router.patch("/cart/quantity/{itemId}")
async def update_cart_quantity(itemId: int, req: UpdateCartQuantityRequest, conn: Connection = Depends(get_db)):
    """
    Update quantity of shopping cart item.

    Args:
        itemId (int): The item's id.
        req (UpdateCartQuantityRequest): The updated item quantity.
        conn (Connection): The database connection.

    Returns:
        dict: A success message.
    """
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE agricultural_shopping_cart SET quantity = %s WHERE id = %s",
            ( req.quantity, itemId )
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        logging.error("Error updating user nearest location: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.post('/order')
async def purchase_product(req: PurchaseProductRequest, conn: Connection = Depends(get_db)):
    """
    Add product order

    Args:
        req(PurchaseProductRequest):The order information
        conn(Connection): The database connection.

    Returns:
        orderId(int):The id of added order.
    """
    cur = conn.cursor()
    try:
        cur.execute("SELECT phone FROM users WHERE id = %s", (req.buyer_id,))
        result = cur.fetchone()
        if result is None:
            raise HTTPException(status_code=404, detail="Buyer not found")
        buyer_phone = result[0] 
        logging.info("Inserting agricultural_product order")
        cur.execute(
            """INSERT INTO agricultural_product_order 
            (seller_id, buyer_id, buyer_name, buyer_phone, produce_id, quantity, starting_point, end_point, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (req.seller_id, req.buyer_id, req.buyer_name, buyer_phone, req.produce_id, req.quantity, req.starting_point, req.end_point, '未接單')
        )
        order_id = cur.fetchone()[0]
        conn.commit()
        return order_id
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.patch("/cart/status/{itemId}")
async def update_cart_item_status(itemId: int, conn: Connection = Depends(get_db)):
    """
    Update quantity of shopping cart item.

    Args:
        itemId (int): The item's id.
        conn (Connection): The database connection.

    Returns:
        dict: A success message.
    """
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE agricultural_shopping_cart SET status = %s WHERE id = %s",
            ( '已送單', itemId )
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        logging.error("Error updating cart item status: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get('/purchased/{userId}', response_model=List[PurchasedProduct])
async def get_purchase_item(userId: int, conn: Connection=Depends(get_db)):
    """
    Get User purchased items

    Args:
        userId(str):The user id
        conn(Connection): The database connection.

    Returns:
        List[PurchasedProductResponse]: A list of purchased items.
    """
    cur = conn.cursor()
    try:
        logging.info("Get purchased items of user whose id is %s.", userId)
        cur.execute(
            """SELECT o.id, o.quantity, o.timestamp, produce.name, produce.price, produce.img_link, o.status
            FROM agricultural_product_order as o
            JOIN agricultural_produce as produce ON o.produce_id=produce.id
            WHERE buyer_id = %s  """, (userId,))

        items = cur.fetchall()
        logging.info('start create purchased product list')
        purchased_item_list:List[PurchasedProduct] = []
        for item in items:
            purchased_item_list.append({
                "order_id":item[0],
                "quantity":item[1],
                "timestamp":str(item[2]),
                "product_name":item[3],
                "product_price":item[4],
                "img_url":item[5],
                "status":item[6]

            })
        return purchased_item_list
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()



