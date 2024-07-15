"""
This module is responsible for importing FastAPI and its dependencies.
"""

import logging
from fastapi import Depends, FastAPI, Request, HTTPException
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List
from pydantic import BaseModel
from datetime import date


# Import Line Bot API
from linebot.v3 import (
    WebhookHandler
)
from linebot.v3.exceptions import (
    InvalidSignatureError
)
from linebot.v3.messaging import (
    ApiClient,
    MessagingApi,
    Configuration,
    TextMessage,
    ReplyMessageRequest
)
from linebot.v3.webhooks import (
    MessageEvent,
    TextMessageContent,
)

# Import handlers
from backend.handlers.order_query import handle_order_query
from backend.handlers.platform_info import handle_platform_info
from backend.handlers.customer_service import handle_customer_service
from backend.handlers.seller import handle_seller
from backend.handlers.buyer import handle_buyer
from backend.handlers.driver import handle_driver

# environment variables
load_dotenv()

# FastAPI app
app = FastAPI()

class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int
    img: str

class Order(BaseModel):
    name: str
    phone: str
    date: str
    time: str
    location: str
    isUrgent: bool
    items: List[OrderItem]
    totalPrice: float
    order_type: str = '購買類'
    order_status: str = '未接單'

class Driver(BaseModel):
    name: str 
    phone: str 
    direction: str
    available_date: str
    start_time: str
    end_time: str

def get_db_connection():
    conn = psycopg2.connect(host="localhost", database="shopping", user="postgres", password="password")
    return conn

@app.post("/api/orders")
async def create_order(order: Order):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Insert order data into orders table
        cur.execute(
            "INSERT INTO orders (name, phone, date, time, location, is_urgent, total_price, order_type, order_status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (order.name, order.phone, order.date, order.time, order.location, order.isUrgent, order.totalPrice, order.order_type, order.order_status)
        )
        order_id = cur.fetchone()[0]
        
        # Insert order items into order_items table
        for item in order.items:
            cur.execute(
                "INSERT INTO order_items (order_id, item_id, item_name, price, quantity, img) VALUES (%s, %s, %s, %s, %s, %s)",
                (order_id, item.id, item.name, item.price, item.quantity, item.img)
            )
        
        conn.commit()
        return {"status": "success", "order_id": order_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/drivers")
async def create_driver(driver: Driver):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            INSERT INTO drivers (name, phone, direction, available_date, start_time, end_time) 
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (driver.name, driver.phone, driver.direction, driver.available_date, driver.start_time, driver.end_time)
        )
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/drivers/{driver_id}")
async def update_driver(driver_id: int, driver: Driver):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            UPDATE drivers SET name = %s, phone = %s, direction = %s, available_date = %s, start_time = %s, end_time = %s
            WHERE id = %s
            """,
            (driver.name, driver.phone, driver.direction, driver.available_date, driver.start_time, driver.end_time, driver_id)
        )
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

# setup Line Bot API
configuration = Configuration(
    access_token='LINE_BOT_TOKEN'
)
handler = WebhookHandler('LINE_BOT_SECRET')


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/callback")
async def callback(request: Request):
    """
    Handle the Line Bot callback request.

    Parameters:
    - request (Request): The HTTP request object.

    Returns:
    - str: The response message.
    """
    signature = request.headers['X-Line-Signature']
    body = await request.body()
    body = body.decode('utf-8')
    logger.info("Request body: %s", body)
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        logger.error("Invalid signature")
        handle_invalid_signature_error()

    return 'OK'

def handle_invalid_signature_error():
    """
    Handles the case when an invalid signature is encountered.

    Raises:
        HTTPException: An exception indicating that the signature is invalid.
    """
    raise HTTPException(status_code=400, detail="Invalid signature")


@handler.add(MessageEvent, message=TextMessageContent)
def handle_message(event):
    """
    Handles incoming messages from users and routes them 
    to the appropriate handlers based on the user's message.

    Parameters:
    - event: The event object containing information about the incoming message.

    Returns:
    - None
    """
    user_message = event.message.text
    logger.info("Message from user: %s", user_message)

    with ApiClient(configuration) as api_client:
        line_bot_api = MessagingApi(api_client)
        if user_message in ["客服", "詢問客服", "詢問"]:
            handle_customer_service(event, line_bot_api)
        elif user_message == "司機":
            handle_driver(event, line_bot_api)
        elif user_message == "賣家":
            handle_seller(event, line_bot_api)
        elif user_message in ["買家", "買東西", "買", "團購"]:
            handle_buyer(event, line_bot_api)
        elif user_message in ["訂單資訊", "訂單查詢", "訂單", "查詢", "處理中的訂單", "進行中的訂單", "已完成的訂單"]:
            handle_order_query(event, line_bot_api)
        elif user_message in ["平台介紹", "介紹"]:
            handle_platform_info(event, line_bot_api)
        else:
            reply_message = TextMessage(text="未知的選擇。")
            line_bot_api.reply_message(
                    ReplyMessageRequest(
                        reply_token=event.reply_token,
                        reply_message=reply_message
                    )
                )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
