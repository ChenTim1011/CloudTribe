from fastapi import APIRouter, HTTPException,Query
from backend.models.order import Order
from backend.models.driver import DriverOrder
from backend.database import get_db_connection
import logging
from pydantic import BaseModel

router = APIRouter()

@router.get("/")
async def get_orders_view_form(role: str = Query(...), phone: str = Query(...)):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        logging.info(f"Fetching orders for role: {role}, phone: {phone}")

        if role == 'buyer':
            cur.execute("SELECT * FROM orders WHERE phone = %s", (phone,))
        elif role == 'driver':
            cur.execute("""
                SELECT orders.*, drivers.name AS driver_name, drivers.phone AS driver_phone, previous_driver.name AS previous_driver_name, previous_driver.phone AS previous_driver_phone 
                FROM orders 
                JOIN driver_orders ON orders.id = driver_orders.order_id 
                LEFT JOIN drivers ON driver_orders.driver_id = drivers.id 
                LEFT JOIN drivers AS previous_driver ON driver_orders.previous_driver_id = previous_driver.id 
                WHERE drivers.phone = %s
            """, (phone,))
        elif role == 'seller':
            cur.execute("SELECT * FROM orders")  # Modify this as per your seller logic
        else:
            raise HTTPException(status_code=400, detail="無效的角色")

        orders = cur.fetchall()
        logging.info(f"Orders fetched: {orders}")
        
        order_list = []
        for order in orders:
            cur.execute("SELECT * FROM order_items WHERE order_id = %s", (order[0],))
            items = cur.fetchall()
            order_list.append({
                "id": order[0],
                "name": order[1],
                "phone": order[2],
                "date": order[3],
                "time": order[4],
                "location": order[5],
                "is_urgent": order[6],
                "total_price": order[7],
                "order_type": order[8],
                "order_status": order[9],
                "items": [{"id": item[2], "name": item[3], "price": item[4], "quantity": item[5], "img": item[6]} for item in items],
                "note": order[10],
                "driver_name": order[11] if 'driver_name' in order else None,
                "driver_phone": order[12] if 'driver_phone' in order else None,
                "previous_driver_name": order[13] if 'previous_driver_name' in order else None,
                "previous_driver_phone": order[14] if 'previous_driver_phone' in order else None,
            })

        return order_list
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="資料庫錯誤")
    except Exception as e:
        logging.error(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail="獲取訂單時出錯")
    finally:
        cur.close()
        conn.close()