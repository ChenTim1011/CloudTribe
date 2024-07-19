"""
This module contains the router for handling orders.

It includes endpoints for creating orders, fetching orders, accepting orders,
transferring orders, retrieving specific orders, and completing orders.
"""

from typing import List
import logging

from psycopg2.extensions import connection as Connection
from fastapi import APIRouter, HTTPException, Depends
from backend.models.models import Order,DriverOrder
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

@router.post("/")
async def create_order(order: Order, conn: Connection = Depends(get_db)):
    """
    Create a new order.

    Args:
        order (Order): The order data to be created.
        conn (Connection): The database connection.

    Returns:
        dict: A success message with the order ID.
    """
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO orders (name, phone, date, time, location, is_urgent, total_price, order_type, order_status, note) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (order.name, order.phone, order.date, order.time, order.location, order.is_urgent, order.total_price, order.order_type, order.order_status, order.note)
        )
        order_id = cur.fetchone()[0]
        for item in order.items:
            cur.execute(
                "INSERT INTO order_items (order_id, item_id, item_name, price, quantity, img) VALUES (%s, %s, %s, %s, %s, %s)",
                (order_id, item.item_id, item.item_name, item.price, item.quantity, item.img)
            )
        conn.commit()
        return {"status": "success", "order_id": order_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get("/", response_model=List[Order])
async def get_orders(conn: Connection = Depends(get_db)):
    """
    Get all unaccepted orders.

    Args:
        conn (Connection): The database connection.

    Returns:
        List[Order]: A list of unaccepted orders.
    """
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM orders WHERE order_status = '未接單'")
        orders = cur.fetchall()
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
                "note": order[10]
            })
        return order_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.post("/{order_id}/accept")
async def accept_order(order_id: int, driver_order: DriverOrder, conn: Connection = Depends(get_db)):
    """
    Accept an order.

    Args:
        order_id (int): The ID of the order to be accepted.
        driver_order (DriverOrder): The driver order data.
        conn (Connection): The database connection.

    Returns:
        dict: A success message.
    """
    cur = conn.cursor()
    try:
        logging.info("Driver %s attempting to accept order %s", driver_order.driver_id, order_id)
        cur.execute("SELECT order_status FROM orders WHERE id = %s FOR UPDATE", (order_id,))
        order = cur.fetchone()
        if order[0] != '未接單':
            raise HTTPException(status_code=400, detail="訂單已被接")
        cur.execute(
            "UPDATE orders SET order_status = %s WHERE id = %s", ('接單', order_id)
        )
        cur.execute(
            "INSERT INTO driver_orders (driver_id, order_id, action) VALUES (%s, %s, %s)",
            (driver_order.driver_id, order_id, '接單')
        )
        conn.commit()
        logging.info("Order %s successfully accepted by driver %s", order_id, driver_order.driver_id)
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        logging.error("Error accepting order %s by driver %s: %s", order_id, driver_order.driver_id, str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.post("/{order_id}/transfer")
async def transfer_order(order_id: int, transfer_request: TransferOrderRequest, conn: Connection = Depends(get_db)):
    """
    Transfer an order to a new driver.

    Args:
        order_id (int): The ID of the order to be transferred.
        transfer_request (TransferOrderRequest): The transfer request data.
        conn (Connection): The database connection.

    Returns:
        dict: A success message.
    """
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, name, phone FROM drivers WHERE phone = %s", (transfer_request.new_driver_phone,))
        new_driver = cur.fetchone()
        if not new_driver:
            raise HTTPException(status_code=404, detail="新司機未註冊")
        new_driver_id = new_driver[0]
        if new_driver_id == transfer_request.current_driver_id:
            raise HTTPException(status_code=400, detail="不能將訂單轉給自己")
        cur.execute("SELECT driver_id FROM driver_orders WHERE order_id = %s AND action = '接單' FOR UPDATE", (order_id,))
        order = cur.fetchone()
        if order[0] != transfer_request.current_driver_id:
            raise HTTPException(status_code=400, detail="當前司機無法轉交此訂單")
        cur.execute("SELECT name, phone FROM drivers WHERE id = %s", (transfer_request.current_driver_id,))
        current_driver = cur.fetchone()
        cur.execute("UPDATE driver_orders SET driver_id = %s, previous_driver_id = %s, previous_driver_name = %s, previous_driver_phone = %s WHERE order_id = %s AND driver_id = %s AND action = '接單'", 
                    (new_driver_id, transfer_request.current_driver_id, current_driver[0], current_driver[1], order_id, transfer_request.current_driver_id))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get("/{order_id}")
async def get_order(order_id: int, conn: Connection = Depends(get_db)):
    """
    Get a specific order by ID.

    Args:
        order_id (int): The ID of the order to retrieve.
        conn (Connection): The database connection.

    Returns:
        dict: The order data.
    """
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
        order = cur.fetchone()
        if not order:
            raise HTTPException(status_code=404, detail="訂單不存在")
        cur.execute("SELECT * FROM order_items WHERE order_id = %s", (order_id,))
        items = cur.fetchall()
        order_data = {
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
            "note": order[10]
        }
        return order_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.post("/{order_id}/complete")
async def complete_order(order_id: int, conn: Connection = Depends(get_db)):
    """
    Complete an order.

    Args:
        order_id (int): The ID of the order to be completed.
        conn (Connection): The database connection.

    Returns:
        dict: A success message.
    """
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
        order = cur.fetchone()
        if not order:
            raise HTTPException(status_code=404, detail="訂單不存在")
        if order[9] != '接單':  
            raise HTTPException(status_code=400, detail="訂單狀態不是接單，無法完成訂單")
        cur.execute("UPDATE orders SET order_status = '已完成訂單' WHERE id = %s", (order_id,))
        conn.commit()
        return {"status": "success", "message": "訂單已完成"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()
