"""
This module contains the router for handling orders.
It includes endpoints for creating orders, fetching orders, accepting orders,
transferring orders, retrieving specific orders, and completing orders.
Endpoints:
- POST /: Create a new order.
- GET /: Get all unaccepted orders.
- POST /{service}/{order_id}/accept: Accept an order.
- POST /{order_id}/transfer: Transfer an order to a new driver.
- GET /{order_id}: Retrieve a specific order by ID.
- POST /{service}/{order_id}: Complete an order.
"""

from typing import List
import logging
from datetime import datetime
import json
from backend.handlers.send_message import LineMessageService
from psycopg2.extensions import connection as Connection
from fastapi import APIRouter, HTTPException, Depends
from backend.models.models import Order, DriverOrder, TransferOrderRequest, DetailedOrder
from backend.database import get_db_connection
import os

line_service = LineMessageService()
router = APIRouter()

log_dir = os.path.join(os.getcwd(), 'backend', 'logs')

if not os.path.exists(log_dir):
    os.makedirs(log_dir)

log_file = os.path.join(log_dir, 'orders.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler(log_file), logging.StreamHandler()]
)

logger = logging.getLogger(__name__)

def log_event(event_type: str, data: dict):
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "data": data
    }
    logger.info(json.dumps(log_data))


def get_db():
    """
    Dependency function to get a database connection.
    """
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

@router.post("/", response_model=Order)
async def create_order(order: DetailedOrder, conn: Connection = Depends(get_db)):
    """
    Create a new order.
    Args:
        order (Order): The order data to be created.
        conn (Connection): The database connection.
    Returns:
        dict: A success message with the order ID.
    """
    logging.info("Order data received: %s", order.model_dump_json())
    cur = conn.cursor()
    try:
        
        log_event("ORDER_CREATION_STARTED", {
            "buyer_id": order.buyer_id,
            "total_price": order.total_price,
            "is_urgent": order.is_urgent,
            "items_count": len(order.items)
        })
            
        cur.execute(
            "INSERT INTO orders (buyer_id, buyer_name, buyer_phone, seller_id, seller_name, seller_phone, date, time, location, is_urgent, total_price, order_type, order_status, note, shipment_count, required_orders_count, previous_driver_id, previous_driver_name, previous_driver_phone) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (order.buyer_id, order.buyer_name, order.buyer_phone, order.seller_id, order.seller_name, order.seller_phone, order.date,
            order.time, order.location, order.is_urgent, order.total_price, order.order_type, order.order_status, order.note, order.shipment_count, order.required_orders_count, order.previous_driver_id, 
            order.previous_driver_name, order.previous_driver_phone)
        )
        order_id = cur.fetchone()[0]
        for item in order.items:
            cur.execute(
                "INSERT INTO order_items (order_id, item_id, item_name, price, quantity, img, location, category) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (order_id, item.item_id, item.item_name, item.price, item.quantity, item.img, item.location, item.category)
            )
        conn.commit()
        order.id = order_id
        log_event("ORDER_CREATED", {
            "order_id": order_id,
            "buyer_id": order.buyer_id,
            "total_price": order.total_price,
            "status": "success"
        })
        return order
    except Exception as e:
        log_event("ORDER_CREATION_ERROR", {
            "error": str(e),
            "buyer_id": order.buyer_id
        })
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
        cur.execute("""
            SELECT id, buyer_id, buyer_name, buyer_phone, location, is_urgent, total_price, 
                order_type, order_status, note 
            FROM orders
        """)
        orders = cur.fetchall()
        order_list = []
        for order in orders:
            cur.execute("SELECT * FROM order_items WHERE order_id = %s", (order[0],))
            items = cur.fetchall()
            order_list.append({
                "id": order[0],
                "buyer_id": order[1],
                "buyer_name": order[2], 
                "buyer_phone": order[3], 
                "location": order[4],
                "is_urgent": bool(order[5]),  
                "total_price": float(order[6]),  
                "order_type": order[7],
                "order_status": order[8],
                "note": order[9],
                "service":'necessities',
                "items": [{
                    #"order_id": item[1], 
                    "item_id": item[2], 
                    "item_name": item[3], 
                    "price": float(item[4]), 
                    "quantity": int(item[5]), 
                    "img": str(item[6]), 
                    "location": str(item[7]),
                    "category":str(item[8])} for item in items]  
            })
        #add
        cur.execute("""
            SELECT agri_p_o.id, agri_p_o.buyer_id, agri_p_o.buyer_name, agri_p_o.buyer_phone, agri_p_o.end_point, agri_p_o.status, agri_p_o.note, 
                    agri_p.id, agri_p.name, agri_p.price, agri_p_o.quantity, agri_p.img_link, agri_p_o.starting_point, agri_p.category, agri_p_o.is_put
            FROM agricultural_product_order as agri_p_o
            JOIN agricultural_produce as agri_p ON agri_p.id = agri_p_o.produce_id
        """)
        agri_orders = cur.fetchall()
        for agri_order in agri_orders:
            try:
                total_price = agri_order[9] * agri_order[10] #price*quantity
            except (ValueError, TypeError) as ve:
                logging.error(f"Invalid price or quantity for agricultural order {agri_order[0]}: {agri_order[9]}, {agri_order[10]}")
                raise HTTPException(status_code=500, detail="Invalid price or quantity data.")
            
            agri_order_dict = {
                "id": agri_order[0],
                "buyer_id": agri_order[1],
                "buyer_name": agri_order[2],
                "buyer_phone": agri_order[3],
                "location":agri_order[4], #商品要送達的目的地
                "is_urgent": False, 
                "total_price": total_price,
                "order_type": '購買類',
                "order_status": agri_order[5], #未接單、已接單、已送達
                "note": agri_order[6],
                "service":'agricultural_product',
                "items": [{
                    "item_id": str(agri_order[7]),
                    "item_name": agri_order[8],
                    "price": agri_order[9],
                    "quantity": agri_order[10],
                    "img": agri_order[11],
                    "location": agri_order[12], #司機拿取農產品的地方
                    "category": agri_order[13]
                }],
                "is_put": agri_order[14]

            }
            order_list.append(agri_order_dict)
        return order_list
    except Exception as e:
        logging.error("Error fetching orders: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.post("/{service}/{order_id}/accept")
async def accept_order(service: str, order_id: int, driver_order: DriverOrder, conn: Connection = Depends(get_db)):
    """
    Accept an order.
    Args:
        order_id (int): The ID of the order to be accepted.
        driver_order (DriverOrder): The driver order data.
        conn (Connection): The database connection.
    Returns:
        dict: A success message.
    """
    logging.info("Received driver_order: %s", driver_order.model_dump_json())
    cur = conn.cursor()
    try:
        
        log_event("ORDER_ACCEPTANCE_STARTED", {
            "order_id": order_id,
            "driver_id": driver_order.driver_id,
            "service": service
        })


        if service == 'necessities':
            cur.execute("SELECT order_status,buyer_id  FROM orders WHERE id = %s FOR UPDATE", (order_id,))
        if service == 'agricultural_product':
            cur.execute("SELECT status,buyer_id  FROM agricultural_product_order WHERE id = %s FOR UPDATE", (order_id,))

        order = cur.fetchone()
        if order:
            # Find buyer ID
            buyer_id = order[1]
            # Send a message to the buyer
            success = await line_service.send_message_to_user(
                buyer_id,
                "司機已接取您的商品，請等待司機送貨👍🏻"
            )
            if not success:
                logger.warning(f"買家 (ID: {buyer_id}) 未綁定 LINE 帳號或發送通知失敗")

        if not order:
            raise HTTPException(status_code=404, detail="訂單未找到")

        order_status = order[0]
        if order_status != '未接單':
            raise HTTPException(status_code=400, detail="訂單已被接")
        if service == 'necessities':
            cur.execute("UPDATE orders SET order_status = %s WHERE id = %s", ('接單', order_id))
        if service == 'agricultural_product':
            cur.execute("UPDATE agricultural_product_order SET status = %s WHERE id = %s", ('接單', order_id))
        cur.execute(
            "INSERT INTO driver_orders (driver_id, order_id, action, timestamp, previous_driver_id, previous_driver_name, previous_driver_phone, service) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (driver_order.driver_id, order_id, '接單', driver_order.timestamp, driver_order.previous_driver_id, driver_order.previous_driver_name, driver_order.previous_driver_phone, driver_order.service)
        )
        conn.commit()
        log_event("ORDER_ACCEPTED", {
            "order_id": order_id,
            "driver_id": driver_order.driver_id,
            "service": service,
            "status": "success"
        })
        return {"status": "success", "message": f"訂單 {order_id} 已成功被接受"}

    except HTTPException as e:
        conn.rollback()
        if e.status_code == 400:
            logging.error("訂單已被接")
        elif e.status_code == 404:
            logging.error("訂單未找到")
        raise e
    except Exception as e:
        conn.rollback()
        log_event("ORDER_ACCEPTANCE_ERROR", {
            "order_id": order_id,
            "driver_id": driver_order.driver_id,
            "error": str(e)
        })
        raise HTTPException(status_code=500, detail="伺服器內部錯誤，請稍後再試") from e
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

        log_event("ORDER_TRANSFER_STARTED", {
            "order_id": order_id,
            "current_driver_id": transfer_request.current_driver_id,
            "new_driver_phone": transfer_request.new_driver_phone
        })

        
        cur.execute(
            "SELECT driver_name, driver_phone FROM drivers WHERE id = %s",
            (transfer_request.current_driver_id,)
        )
        current_driver = cur.fetchone()
        if not current_driver:
            raise HTTPException(status_code=404, detail="找不到原始司機資訊")
        
        current_driver_name = current_driver[0]
        current_driver_phone = current_driver[1]

        
        # Find new driver by phone
        cur.execute("SELECT id,user_id, driver_name, driver_phone FROM drivers WHERE driver_phone = %s", (transfer_request.new_driver_phone,))
        new_driver = cur.fetchone()

        if not new_driver:
            raise HTTPException(status_code=404, detail="新司機未註冊")
        new_driver_id = new_driver[0]

        if new_driver_id == transfer_request.current_driver_id:
            raise HTTPException(status_code=400, detail="不能將訂單轉給自己")

        if new_driver:
            # send notification to new driver
            notification_message = (
                f"您有一筆新的轉單訂單 (訂單編號: {order_id})\n"
                f"轉單來自司機: {current_driver_name}\n"
                f"聯絡電話: {current_driver_phone}"
            )
            
            success = await line_service.send_message_to_user(
                # new_driver[1]=user_id
                new_driver[1],
                notification_message
            )
            if not success:
                logger.warning(f"司機 (ID: {new_driver[1]}) 未綁定 LINE 帳號或發送通知失敗")

        # Ensure current driver is assigned to the order
        cur.execute("SELECT driver_id FROM driver_orders WHERE order_id = %s AND action = '接單' FOR UPDATE", (order_id,))
        order = cur.fetchone()
        if order[0] != transfer_request.current_driver_id:
            raise HTTPException(status_code=400, detail="當前司機無法轉交此訂單")

        # Get current driver details
        cur.execute("SELECT driver_name, driver_phone FROM drivers WHERE id = %s", (transfer_request.current_driver_id,))
        current_driver = cur.fetchone()
        
        # Update driver_orders with new driver details
        cur.execute(
            "UPDATE driver_orders SET driver_id = %s, previous_driver_id = %s, previous_driver_name = %s, "
            "previous_driver_phone = %s WHERE order_id = %s AND driver_id = %s AND action = '接單'", 
            (new_driver_id, transfer_request.current_driver_id, current_driver[0], current_driver[1], order_id, transfer_request.current_driver_id)
        )
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
    Get a specific necessities' order by ID.
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
            "buyer_id": order[1],
            "buyer_name": order[2],  # str
            "buyer_phone": order[3],  # str
            "seller_id": int(order[4]),  # int
            "seller_name": order[5],  # str
            "seller_phone": order[6],  # str
            "date": order[7].isoformat(),  # str
            "time": order[8].isoformat(),  # str
            "location": order[9],
            "is_urgent": bool(order[10]),  # bool
            "total_price": (order[11]),  # float
            "order_type": order[12],
            "order_status": order[13],
            "note": order[14],
            "shipment_count": order[15],
            "required_orders_count": order[16],
            "previous_driver_id": order[17],
            "previous_driver_name": order[18],
            "previous_driver_phone": order[19],
            "items": [{"order_id": item[1], "item_id": item[2], "item_name": item[3], "price": (item[4]), "quantity": int(item[5]), 
                       "img": str(item[6]),"location": str(item[7]),"category":str(item[8])} for item in items]
        }
        return order_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()


@router.post("/{service}/{order_id}/complete")
async def complete_order(service: str, order_id: int, conn = Depends(get_db)):
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

        log_event("ORDER_COMPLETION_STARTED", {
            "order_id": order_id,
            "service": service
        })


        if service == 'necessities':
            # Check if order exists
            cur.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
            order = cur.fetchone()

            success = False
            if order:
                # order[1] = buyer_id
                buyer_id = order[1]
                # Send a message to the buyer
                success = await line_service.send_message_to_user(
                    buyer_id,
                    "您的貨品已送達目的地，請盡快到指定地點領取😆"
                )
                if not success:
                    logger.warning(f"買家 (ID: {buyer_id}) 未綁定 LINE 帳號或發送通知失敗")

            if not order:
                raise HTTPException(status_code=404, detail="訂單不存在")
            if order[13] != '接單':
                raise HTTPException(status_code=400, detail="訂單狀態不是接單，無法完成訂單")
            
            # Update the order status
            cur.execute("UPDATE orders SET order_status = '已完成' WHERE id = %s", (order_id,))
            
            # Update the driver_orders action
            cur.execute("""
                UPDATE driver_orders
                SET action = '完成'
                WHERE order_id = %s and service = %s
            """, (order_id, 'necessities'))
        if service == 'agricultural_product':
             # Check if order exists
            cur.execute("SELECT * FROM agricultural_product_order WHERE id = %s", (order_id,))
            order = cur.fetchone()

            success = False
            if order:
                buyer_id = order[1]
                # Send a message to the buyer
                success = await line_service.send_message_to_user(
                    buyer_id,
                    "您的貨品已送達目的地，請盡快到指定地點領取😆"
                )
                if not success:
                    logger.warning(f"買家 (ID: {buyer_id}) 未綁定 LINE 帳號或發送通知失敗")

            if not order:
                raise HTTPException(status_code=404, detail="訂單不存在")
            if order[10] != '接單':
                raise HTTPException(status_code=400, detail="訂單狀態不是接單，無法完成訂單")
            
            # Update the order status
            cur.execute("UPDATE agricultural_product_order SET status = '已送達' WHERE id = %s", (order_id,))
            
            # Update the driver_orders action
            cur.execute("""
                UPDATE driver_orders
                SET action = '完成'
                WHERE order_id = %s and service = %s
            """, (order_id, 'agricultural_product'))
        


        conn.commit()
        log_event("ORDER_COMPLETED", {
            "order_id": order_id,
            "service": service,
            "status": "success"
        })
        return {"status": "success", "message": "訂單已完成"}
    except Exception as e:
        log_event("ORDER_COMPLETION_ERROR", {
            "order_id": order_id,
            "service": service,
            "error": str(e)
        })
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()