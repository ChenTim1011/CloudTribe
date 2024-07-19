"""
This module contains the router for handling order views based on user roles.

It includes an endpoint for fetching orders for buyers, drivers, and sellers.
"""

import logging
from typing import List, Dict, Any

from psycopg2 import Error
from psycopg2.extensions import connection as Connection

from fastapi import APIRouter, HTTPException, Query, Depends
from backend.database import get_db_connection


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

@router.get("/", response_model=List[Dict[str, Any]])
async def get_orders_view_form(role: str = Query(...), phone: str = Query(...), conn: Connection = Depends(get_db)):
    """
    Fetch orders based on user role and phone number.

    Args:
        role (str): The role of the user (buyer, driver, seller).
        phone (str): The phone number of the user.
        conn (Connection): The database connection.

    Returns:
        list: A list of orders based on the user role.
    """
    cur = conn.cursor()
    try:
        logging.info("Fetching orders for role: %s, phone: %s", role, phone)

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
        logging.info("Orders fetched: %s", orders)

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
                "driver_name": order[11] if len(order) > 11 else None,
                "driver_phone": order[12] if len(order) > 12 else None,
                "previous_driver_name": order[13] if len(order) > 13 else None,
                "previous_driver_phone": order[14] if len(order) > 14 else None,
            })

        return order_list
    except Error as e:
        logging.error("Database error: %s", e)
        raise HTTPException(status_code=500, detail="資料庫錯誤") from e
    except Exception as e:
        logging.error("Error fetching orders: %s", e)
        raise HTTPException(status_code=500, detail="獲取訂單時出錯") from e
    finally:
        cur.close()
        conn.close()
