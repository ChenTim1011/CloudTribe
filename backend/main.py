"""
This module is responsible for importing FastAPI and its dependencies.
"""
import logging
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.routers import orders, drivers, users, seller, consumer
from collections import defaultdict

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
    user_message = event.message.text
    line_user_id = event.source.user_id
    logger.info("Message from LINE user: %s, content: %s", line_user_id, user_message)

    with ApiClient(configuration) as api_client:
        line_bot_api = MessagingApi(api_client)
        

        if user_message == "綁定":
            user_states[line_user_id] = "waiting_for_phone"
            line_bot_api.reply_message(
                ReplyMessageRequest(
                    reply_token=event.reply_token,
                    messages=[TextMessage(text="請輸入您的電話號碼")]
                )
            )
            return

        
        if user_states.get(line_user_id) == "waiting_for_phone":
            try:
                phone = user_message.strip()
                
                #  check if the phone number is valid
                if not phone.isdigit():
                    line_bot_api.reply_message(
                        ReplyMessageRequest(
                            reply_token=event.reply_token,
                            messages=[TextMessage(text="請輸入有效的電話號碼")]
                        )
                    )
                    return

                # Check if the phone number is already bound to an account
                with get_db_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
                    user = cur.fetchone()
                    
                    if user:
                        # Update the user's line_user_id
                        cur.execute(
                            "UPDATE users SET line_user_id = %s WHERE id = %s",
                            (line_user_id, user[0])
                        )
                        conn.commit()
                        reply_text = "帳號綁定成功！"
                    else:
                        reply_text = "找不到對應的用戶，請確認電話號碼是否正確。"
                    
                    line_bot_api.reply_message(
                        ReplyMessageRequest(
                            reply_token=event.reply_token,
                            messages=[TextMessage(text=reply_text)]
                        )
                    )
                
                
                del user_states[line_user_id]
                
            except Exception as e:
                logger.error("Error binding LINE account: %s", str(e))
                line_bot_api.reply_message(
                    ReplyMessageRequest(
                        reply_token=event.reply_token,
                        messages=[TextMessage(text="綁定失敗，請稍後再試。")]
                    )
                )
                
                del user_states[line_user_id]
            return

        elif user_message in ["客服", "詢問客服", "詢問"]:
            handle_customer_service(event, line_bot_api)
        else:
            line_bot_api.reply_message(
                ReplyMessageRequest(
                    reply_token=event.reply_token,
                    messages=[TextMessage(text="請輸入「綁定」來開始綁定帳號，或輸入「客服」尋求協助。")]
                )
            )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8001, reload=True)
