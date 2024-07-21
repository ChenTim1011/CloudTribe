"""
This module contains the router for handling order views based on user roles.

It includes an endpoint for fetching orders for buyers, drivers, and sellers.

Endpoints:
- GET /: Fetch orders based on user role and phone number.

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
            cur.execute("""
                SELECT o.id, u_b.name AS buyer_name, u_b.phone AS buyer_phone, o.seller_id, u_s.name AS seller_name, u_s.phone AS seller_phone,
                       o.date, o.time, o.location, o.is_urgent, o.total_price, o.order_type, o.order_status, o.note,
                       o.shipment_count, o.required_orders_count, o.previous_driver_id, u_d.name AS previous_driver_name, u_d.phone AS previous_driver_phone
                FROM orders o
                JOIN users u_b ON o.buyer_id = u_b.id
                JOIN users u_s ON o.seller_id = u_s.id
                LEFT JOIN users u_d ON o.previous_driver_id = u_d.id
                WHERE o.buyer_id = (SELECT id FROM users WHERE phone = %s)
            """, (phone,))
        elif role == 'driver':
            cur.execute("""
                SELECT o.id, u_b.name AS buyer_name, u_b.phone AS buyer_phone, o.seller_id, u_s.name AS seller_name, u_s.phone AS seller_phone,
                       o.date, o.time, o.location, o.is_urgent, o.total_price, o.order_type, o.order_status, o.note,
                       o.shipment_count, o.required_orders_count, o.previous_driver_id, u_d.name AS previous_driver_name, u_d.phone AS previous_driver_phone
                FROM orders o
                JOIN driver_orders do ON o.id = do.order_id
                JOIN users u_b ON o.buyer_id = u_b.id
                JOIN users u_s ON o.seller_id = u_s.id
                LEFT JOIN users u_d ON o.previous_driver_id = u_d.id
                WHERE do.driver_id = (SELECT user_id FROM drivers WHERE phone = %s) AND do.action = '接單'
            """, (phone,))
        elif role == 'seller':
            cur.execute("""
                SELECT o.id, u_b.name AS buyer_name, u_b.phone AS buyer_phone, o.seller_id, u_s.name AS seller_name, u_s.phone AS seller_phone,
                       o.date, o.time, o.location, o.is_urgent, o.total_price, o.order_type, o.order_status, o.note,
                       o.shipment_count, o.required_orders_count, o.previous_driver_id, u_d.name AS previous_driver_name, u_d.phone AS previous_driver_phone
                FROM orders o
                JOIN users u_b ON o.buyer_id = u_b.id
                JOIN users u_s ON o.seller_id = u_s.id
                LEFT JOIN users u_d ON o.previous_driver_id = u_d.id
                WHERE o.seller_id = (SELECT id FROM users WHERE phone = %s)
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
                "buyer_id": order[1],
                "buyer_name": order[2],
                "buyer_phone": order[3],
                "seller_id": int(order[4]),
                "seller_name": order[5],
                "seller_phone": order[6],
                "date": order[7].isoformat(),
                "time": order[8].isoformat(),
                "location": order[9],
                "is_urgent": bool(order[10]),
                "total_price": float(order[11]),
                "order_type": order[12],
                "order_status": order[13],
                "note": order[14],
                "shipment_count": order[15],
                "required_orders_count": order[16],
                "previous_driver_id": order[17],
                "previous_driver_name": order[18],
                "previous_driver_phone": order[19],
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
