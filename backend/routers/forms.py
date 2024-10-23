"""
This module provides API endpoints for managing orders based on user roles (buyer, seller, driver).

It includes endpoints for fetching orders based on the user's role and phone number, filtering the data accordingly,
and returning detailed order information along with associated items.

Endpoints:
- GET /: Fetch orders for a user based on their role (buyer, seller, driver) and phone number.
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
    Dependency function to get a database connection.
    Ensures the connection is closed after the request is processed.
    """
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_orders_view_form(role: str = Query(...), phone: str = Query(...), conn: Connection = Depends(get_db)):
    """
    Fetch orders based on the user's role and phone number.

    Args:
    - role: str - The role of the user (buyer, seller, driver).
    - phone: str - The phone number of the user.
    - conn: Connection - Database connection (provided by dependency).

    Returns:
    - List[Dict[str, Any]]: List of orders with detailed information and associated items.

    Raises:
    - HTTPException: If the role is invalid or a database error occurs.
    """
    cur = conn.cursor()
    try:
        logging.info("Fetching orders for role: %s, phone: %s", role, phone)

        if role == 'buyer':
            cur.execute("""
                SELECT orders.id, orders.buyer_name, orders.buyer_phone, orders.seller_id, orders.seller_name, orders.seller_phone,
                       orders.date, orders.time, orders.location, orders.is_urgent, orders.total_price, orders.order_type, orders.order_status, orders.note,
                       orders.shipment_count, orders.required_orders_count, orders.previous_driver_id, orders.previous_driver_name, orders.previous_driver_phone
                FROM orders
                WHERE orders.buyer_phone = %s
            """, (phone,))
        elif role == 'driver':
            cur.execute("""
                SELECT orders.id, orders.buyer_name, orders.buyer_phone, orders.seller_id, orders.seller_name, orders.seller_phone,
                       orders.date, orders.time, orders.location, orders.is_urgent, orders.total_price, orders.order_type, orders.order_status, orders.note,
                       orders.shipment_count, orders.required_orders_count, orders.previous_driver_id, orders.previous_driver_name, orders.previous_driver_phone
                FROM orders
                JOIN driver_orders ON orders.id = driver_orders.order_id
                WHERE driver_orders.driver_id = (SELECT id FROM drivers WHERE driver_phone = %s) AND driver_orders.action = '接單'
            """, (phone,))
        elif role == 'seller':
            cur.execute("""
                SELECT orders.id, orders.buyer_name, orders.buyer_phone, orders.seller_id, orders.seller_name, orders.seller_phone,
                       orders.date, orders.time, orders.location, orders.is_urgent, orders.total_price, orders.order_type, orders.order_status, orders.note,
                       orders.shipment_count, orders.required_orders_count, orders.previous_driver_id, orders.previous_driver_name, orders.previous_driver_phone
                FROM orders
                WHERE orders.seller_phone = %s
            """, (phone,))
        else:
            raise HTTPException(status_code=400, detail="無效的角色")

        orders = cur.fetchall()
        logging.info("Orders fetched: %s", orders)

        order_list = []
        for order in orders:
            cur.execute("SELECT * FROM order_items WHERE order_id = %s", (order[0],))
            items = cur.fetchall()
            order_data = {
                "id": order[0],
                "buyer_name": order[1],
                "buyer_phone": order[2],
                "seller_id": int(order[3]),
                "seller_name": order[4],
                "seller_phone": order[5],
                "date": order[6].isoformat(),
                "time": order[7].isoformat(),
                "location": order[8],
                "is_urgent": bool(order[9]),
                "total_price": float(order[10]),
                "order_type": order[11],
                "order_status": order[12],
                "note": order[13],
                "shipment_count": order[14],
                "required_orders_count": order[15],
                "previous_driver_id": order[16],
                "previous_driver_name": order[17],
                "previous_driver_phone": order[18],
                "items": [{"order_id": item[1], "item_id": item[2], "item_name": item[3], "price": float(item[4]), "quantity": int(item[5]), "img": str(item[6])} for item in items]
            }
            order_list.append(order_data)

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
