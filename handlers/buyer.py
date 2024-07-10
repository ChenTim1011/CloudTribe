import json
import os
import logging
from linebot.models import (
    FlexSendMessage, TextSendMessage, PostbackEvent, MessageEvent, TextMessage
)
from shopping.cart import view_cart, checkout
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import LineBotApiError

logger = logging.getLogger(__name__)

line_bot_api = LineBotApi(os.getenv('LINE_BOT_TOKEN'))
handler = WebhookHandler(os.getenv('LINE_BOT_SECRET'))

# 使用字典來儲存每個使用者的狀態
user_states = {}

def handle_buyer(event, line_bot_api):
    user_id = event.source.user_id

    # 建立包含連結的 Flex Message
    flex_message = FlexSendMessage(
        alt_text="買家功能",
        contents={
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "請點擊以下連結進入購物頁面",
                        "wrap": True,
                        "weight": "bold",
                        "size": "lg"
                    },
                    {
                        "type": "button",
                        "action": {
                            "type": "uri",
                            "label": "前往購物",
                            "uri": "http:/localhost/shopping/shoppingsheet.html"
                        },
                        "style": "primary",
                        "color": "#1DB446"
                    }
                ]
            }
        }
    )

    # 回應 Flex Message
    try:
        line_bot_api.reply_message(event.reply_token, flex_message)
    except LineBotApiError as e:
        logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")

def handle_postback(event, line_bot_api):
    data = event.postback.data
    user_id = event.source.user_id

    if data == 'action=view_cart':
        cart_content = view_cart(user_id)
        try:
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=str(cart_content)))
        except LineBotApiError as e:
            logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")

    elif data == 'action=checkout':
        order = checkout(user_id)
        try:
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=f"您的訂單已提交: {order}"))
        except LineBotApiError as e:
            logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")

def handle_text(event, line_bot_api):
    user_message = event.message.text
    user_id = event.source.user_id
    logger.info("Message from user: %s", user_message)

    if user_message == "我要買東西":
        handle_buyer(event, line_bot_api)
        user_states[user_id] = None  # 重置用戶狀態

    elif user_message == "查看訂單":
        cart_content = view_cart(user_id)
        try:
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=str(cart_content)))
        except LineBotApiError as e:
            logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")

    else:
        try:
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text="未知的選擇。"))
        except LineBotApiError as e:
            logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")

@handler.add(PostbackEvent)
def handle_postback_event(event):
    handle_postback(event, line_bot_api)

@handler.add(MessageEvent, message=TextMessage)
def handle_message_event(event):
    handle_text(event, line_bot_api)
