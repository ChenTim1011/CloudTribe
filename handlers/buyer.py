import json
import os
import logging
from linebot.models import (
    FlexSendMessage, TextSendMessage, BubbleContainer, BoxComponent, TextComponent,
    ButtonComponent, URIAction, PostbackEvent, PostbackAction, MessageEvent, TextMessage
)
from shopping.search import search_products
from shopping.cart import add_to_cart, view_cart, checkout
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import LineBotApiError

logger = logging.getLogger(__name__)

line_bot_api = LineBotApi(os.getenv('LINE_BOT_TOKEN'))
handler = WebhookHandler(os.getenv('LINE_BOT_SECRET'))

# 使用字典來儲存每個使用者的狀態
user_states = {}

def handle_buyer(event, line_bot_api):
    user_id = event.source.user_id
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, 'buyer_flex_message.json')

    # 讀取 JSON 檔案
    with open(json_path, 'r', encoding='utf-8') as f:
        flex_content = json.load(f)
    # 建立 Flex Message
    flex_message = FlexSendMessage(
        alt_text="平台介紹",
        contents=flex_content
    )

    # 回應 Flex Message
    try:
        line_bot_api.reply_message(event.reply_token, flex_message)
    except LineBotApiError as e:
        logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")

def handle_postback(event, line_bot_api):
    data = event.postback.data
    user_id = event.source.user_id

    if data == 'action=one_buy':
        flex_message = FlexSendMessage(
            alt_text="請輸入關鍵字",
            contents={
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "請輸入:搜尋+你要找的商品",
                            "wrap": True,
                            "weight": "bold",
                            "size": "lg"
                        }
                    ]
                }
            }
        )
        user_states[user_id] = 'searching'
        try:
            line_bot_api.reply_message(event.reply_token, flex_message)
        except LineBotApiError as e:
            logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")

    elif data == 'action=group_buying':
        try:
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text="團購功能尚未實現。"))
        except LineBotApiError as e:
            logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")

    elif data == 'action=view_cart':
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

    if user_message.startswith("搜尋"):
        keyword = user_message[2:].strip()  # 去除前綴「搜尋」並去除多餘空格
        logger.info("Keyword is : %s", keyword)
        products = search_products(keyword)
        bubbles = []
        for product in products:
            bubble = BubbleContainer(
                body=BoxComponent(
                    layout='vertical',
                    contents=[
                        TextComponent(text=product['title'], weight='bold', size='xl'),
                        TextComponent(text=f"價格: {product['price']}"),
                        ButtonComponent(
                            action=URIAction(label='查看', uri=product['link'])
                        ),
                        ButtonComponent(
                            action=PostbackAction(label='加入購物車', data=f"action=add_to_cart&product_id={product['product_id']}")
                        )
                    ]
                )
            )
            bubbles.append(bubble)

        if bubbles:  # 確保 bubbles 列表不為空
            message = FlexSendMessage(alt_text="商品列表", contents={"type": "carousel", "contents": bubbles})
            try:
                line_bot_api.reply_message(event.reply_token, message)
            except LineBotApiError as e:
                logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")
        else:
            try:
                line_bot_api.reply_message(event.reply_token, TextSendMessage(text="沒有找到相關商品。"))
            except LineBotApiError as e:
                logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")
        
        user_states[user_id] = None  # 重置用戶狀態

    elif user_message == "查看購物車":
        cart_content = view_cart(user_id)
        try:
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=str(cart_content)))
        except LineBotApiError as e:
            logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")

    elif user_message == "結帳":
        order = checkout(user_id)
        try:
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=f"您的訂單已提交: {order}"))
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
