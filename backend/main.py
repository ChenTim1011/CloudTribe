"""
This module is responsible for importing FastAPI and its dependencies.
"""
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

import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.routers import orders, drivers, forms, users


# environment variables
load_dotenv()

app = FastAPI()

# Register routers
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["drivers"])
app.include_router(forms.router, prefix="/api/forms", tags=["forms"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can change this to specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
