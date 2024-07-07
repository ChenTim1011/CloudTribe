import logging
from fastapi import FastAPI, Request, HTTPException
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import MessageEvent, TextMessage, PostbackEvent
import os
from dotenv import load_dotenv

# Import handlers
from handlers.order_query import handle_order_query
from handlers.platform_info import handle_platform_info
from handlers.customer_service import handle_customer_service
from handlers.seller import handle_seller
from handlers.buyer import handle_buyer, handle_postback_event, handle_message_event
from handlers.driver import handle_driver

# 加載環境變數
load_dotenv()

app = FastAPI()

# 設定你的Channel Secret和Access Token
line_bot_api = LineBotApi(os.getenv('LINE_BOT_TOKEN'))
handler = WebhookHandler(os.getenv('LINE_BOT_SECRET'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 使用字典來儲存每個使用者的狀態
user_states = {}

@app.get("/")
async def read_root():
    return {"message": "Service is up and running"}

@app.post("/callback")
async def callback(request: Request):
    signature = request.headers['X-Line-Signature']
    body = await request.body()
    body = body.decode('utf-8')
    logger.info("Request body: %s", body)
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        logger.error("Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    return 'OK'

@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    user_id = event.source.user_id
    user_message = event.message.text
    logger.info("Message from user: %s", user_message)

    # 根據使用者狀態來處理消息
    user_state = user_states.get(user_id, None)
    
    if user_message.startswith("搜尋"):
        handle_message_event(event)
    else:
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
            line_bot_api.reply_message(event.reply_token, reply_message)

@handler.add(PostbackEvent)
def handle_postback(event):
    handle_postback_event(event)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
