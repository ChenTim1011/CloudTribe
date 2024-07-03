import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import PostbackEvent, MessageEvent, TextMessage
from linebot.models import RichMenu, RichMenuArea, RichMenuBounds, RichMenuSize, PostbackAction
import os
from dotenv import load_dotenv

# Import handlers
from handlers.order_query import handle_order_query
from handlers.platform_info import handle_platform_info
from handlers.customer_service import handle_customer_service
from handlers.seller import handle_seller
from handlers.buyer import handle_buyer
from handlers.driver import handle_driver

load_dotenv()  # Load environment variables from .env file

app = FastAPI()

# 設定你的Channel Secret和Access Token
line_bot_api = LineBotApi(os.getenv('LINE_BOT_TOKEN'))
handler = WebhookHandler(os.getenv('LINE_BOT_SECRET'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



@app.get("/")
async def read_root():
    return {"message": "Service is up and running"}

@app.post("/callback")
async def callback(request: Request):
    signature = request.headers['X-Line-Signature']
    body = await request.body()
    body = body.decode('utf-8')
    logger.info(f"Request body: {body}")
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        logger.error("Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    return 'OK'

@handler.add(PostbackEvent)
def handle_postback(event):
    data = event.postback.data
    logger.info(f"Postback data: {data}")
    if data == "action=seller":
        handle_seller(event, line_bot_api)
    elif data == "action=buyer":
        handle_buyer(event, line_bot_api)
    elif data == "action=driver":
        handle_driver(event, line_bot_api)
    elif data == "action=platform_info":
        handle_platform_info(event, line_bot_api)
    elif data == "action=query_order":
        handle_order_query(event, line_bot_api)
    elif data == "action=ask_ai":
        handle_customer_service(event, line_bot_api)
    else:
        logger.warning(f"Unknown action: {data}")
        reply_message = TextSendMessage(text="未知的選擇。")
        line_bot_api.reply_message(event.reply_token, reply_message)

@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    user_message = event.message.text
    logger.info(f"Message from user: {user_message}")

    if user_message in ["客服", "詢問客服", "詢問"]:
        handle_customer_service(event, line_bot_api)
   



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
