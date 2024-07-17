from fastapi import APIRouter, HTTPException
from backend.models.order import Order
from backend.models.driver import DriverOrder
from backend.database import get_db_connection
import logging
from pydantic import BaseModel

class TransferOrderRequest(BaseModel):
    current_driver_id: int
    new_driver_phone: str



router = APIRouter()

@router.post("/")
async def create_order(order: Order):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "INSERT INTO orders (name, phone, date, time, location, is_urgent, total_price, order_type, order_status, note) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (order.name, order.phone, order.date, order.time, order.location, order.is_urgent, order.totalPrice, order.order_type, order.order_status, order.note)
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
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/")
async def get_orders():
    conn = get_db_connection()
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
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.post("/{order_id}/accept")
async def accept_order(order_id: int, driver_order: DriverOrder):
    conn = get_db_connection()
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
        logging.info(f"Order {order_id} successfully accepted by driver {driver_order.driver_id}")
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        logging.error(f"Error accepting order {order_id} by driver {driver_order.driver_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.post("/{order_id}/transfer")
async def transfer_order(order_id: int, transfer_request: TransferOrderRequest):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id, name, phone FROM drivers WHERE phone = %s", (transfer_request.new_driver_phone,))
        new_driver = cur.fetchone()
        if not new_driver:
            raise HTTPException(status_code=404, detail="新司機未註冊")

        new_driver_id = new_driver[0]
        new_driver_name = new_driver[1]
        new_driver_phone = new_driver[2]

        if new_driver_id == transfer_request.current_driver_id:
            raise HTTPException(status_code=400, detail="不能將訂單轉給自己")

        cur.execute("SELECT driver_id FROM driver_orders WHERE order_id = %s AND action = '接單' FOR UPDATE", (order_id,))
        order = cur.fetchone()
        if order[0] != transfer_request.current_driver_id:
            raise HTTPException(status_code=400, detail="當前司機無法轉交此訂單")

        cur.execute("SELECT name, phone FROM drivers WHERE id = %s", (transfer_request.current_driver_id,))
        current_driver = cur.fetchone()
        current_driver_name = current_driver[0]
        current_driver_phone = current_driver[1]

        cur.execute("UPDATE driver_orders SET driver_id = %s, previous_driver_id = %s, previous_driver_name = %s, previous_driver_phone = %s WHERE order_id = %s AND driver_id = %s AND action = '接單'", 
                    (new_driver_id, transfer_request.current_driver_id, current_driver_name, current_driver_phone, order_id, transfer_request.current_driver_id))

        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


