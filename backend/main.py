"""
This module is responsible for importing FastAPI and its dependencies.
"""
import logging
import os
import re
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.routers import orders, drivers, users, seller, consumer
from collections import defaultdict
import re

# Dictionary to store user registration states
user_states = defaultdict(str)

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
from .handlers.customer_service import handle_customer_service
from .handlers.send_message import LineMessageService

# Import database connection function
from backend.database import get_db_connection



# environment variables
load_dotenv()

line_bot_token = os.getenv('LINE_BOT_TOKEN')
line_bot_secret = os.getenv('LINE_BOT_SECRET')


app = FastAPI()

# Register routers
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["drivers"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(seller.router, prefix="/api/seller", tags=["seller"])
app.include_router(consumer.router, prefix="/api/consumer", tags=["consumer"])

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
    access_token=line_bot_token
)
handler = WebhookHandler(line_bot_secret)
line_message_service = LineMessageService()

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

    body = (await request.body()).decode('utf-8')
    logger.info("Request body: %s", body)
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        logger.error("Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        logger.exception("Unhandled exception occurred during webhook handling")
        raise HTTPException(status_code=500, detail="Internal Server Error")

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
    user_message = event.message.text.strip()
    line_user_id = event.source.user_id
    logger.info("Message from LINE user: %s, content: %s", line_user_id, user_message)
    
    # Initialize Line Bot API for replying
    with ApiClient(configuration) as api_client:
        line_bot_api = MessagingApi(api_client)
        
        # If user sends "註冊", reply with instructions
        if user_message == "註冊":
            # Show demo format message
            line_bot_api.reply_message(
                ReplyMessageRequest(
                    reply_token=event.reply_token,
                    messages=[TextMessage(text="請依照以下格式輸入：\n姓名/電話號碼\n例如：橘子/09123456789")]
                )
            )
            # Set user state to waiting for unified input
            user_states[line_user_id] = "waiting_for_input"
            return
        
        # If user sends "取消", then clear registration state
        if user_message == "取消":
            if line_user_id in user_states:
                del user_states[line_user_id]
            line_bot_api.reply_message(
                ReplyMessageRequest(
                    reply_token=event.reply_token,
                    messages=[TextMessage(text="已取消註冊流程。如需重新開始，請輸入「註冊」")]
                )
            )
            return
        
        # Process registration input if state is waiting for input
        if user_states.get(line_user_id) == "waiting_for_input":
            # Expect format: "Name/PhoneNumber"
            if "/" not in user_message:
                line_bot_api.reply_message(
                    ReplyMessageRequest(
                        reply_token=event.reply_token,
                        messages=[TextMessage(text="格式不正確，請依照格式：\n姓名/電話號碼\n例如：橘子/09123456789")]
                    )
                )
                return
            
            parts = user_message.split("/")
            if len(parts) != 2:
                line_bot_api.reply_message(
                    ReplyMessageRequest(
                        reply_token=event.reply_token,
                        messages=[TextMessage(text="格式不正確，請依照格式：\n姓名/電話號碼\n例如：橘子/09123456789")]
                    )
                )
                return

            name, phone = parts[0].strip(), parts[1].strip()
            # Validate name: only Chinese or letters
            if not re.match(r'^[\u4e00-\u9fa5A-Za-z]+$', name):
                line_bot_api.reply_message(
                    ReplyMessageRequest(
                        reply_token=event.reply_token,
                        messages=[TextMessage(text="姓名格式不正確，僅允許中文及英文字母。請重新輸入。")]
                    )
                )
                return

            # Validate phone: must be digits and 7~10 characters
            if not (phone.isdigit() and 7 <= len(phone) <= 10):
                line_bot_api.reply_message(
                    ReplyMessageRequest(
                        reply_token=event.reply_token,
                        messages=[TextMessage(text="電話號碼格式不正確，必須是7-10位數字。請重新輸入。")]
                    )
                )
                return

            try:
                # Check if phone already registered
                with get_db_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
                    existing_user = cur.fetchone()
                    if existing_user:
                        line_bot_api.reply_message(
                            ReplyMessageRequest(
                                reply_token=event.reply_token,
                                messages=[TextMessage(text="該電話號碼已被註冊。請使用其他號碼。")]
                            )
                        )
                        # Clear state to allow re-registration
                        if line_user_id in user_states:
                            del user_states[line_user_id]
                        return

                    # Create new user in the database
                    cur.execute(
                        "INSERT INTO users (name, phone, location, is_driver, line_user_id) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                        (name, phone, '未選擇', False, line_user_id)
                    )
                    conn.commit()
                    line_bot_api.reply_message(
                        ReplyMessageRequest(
                            reply_token=event.reply_token,
                            messages=[TextMessage(text=f"註冊成功！\n姓名：{name}\n電話：{phone}")]
                        )
                    )
                # Clear registration state after success
                if line_user_id in user_states:
                    del user_states[line_user_id]
            except Exception as e:
                logger.error("Error during registration: %s", str(e))
                line_bot_api.reply_message(
                    ReplyMessageRequest(
                        reply_token=event.reply_token,
                        messages=[TextMessage(text="註冊過程發生錯誤，請稍後再試。如需協助，請輸入「客服」")]
                    )
                )
                if line_user_id in user_states:
                    del user_states[line_user_id]
            return
        
        # If message equals "客服", then forward to customer service handler
        elif user_message in ["客服", "詢問客服", "詢問"]:
            handle_customer_service(event, line_bot_api)
            return
        
        # Default reply
        else:
            line_bot_api.reply_message(
                ReplyMessageRequest(
                    reply_token=event.reply_token,
                    messages=[TextMessage(text="請輸入「註冊」來註冊新帳號，或輸入「客服」尋求協助。")]
                )
            )
            
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8001, reload=True)
