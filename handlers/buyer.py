import json
import os
import logging
from linebot.models import (
    FlexSendMessage, TextSendMessage, BubbleContainer, BoxComponent, TextComponent,
    ButtonComponent, URIAction, PostbackEvent, PostbackAction
)
from shopping.search import search_products
from shopping.cart import add_to_cart, view_cart, checkout
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import LineBotApiError

logger = logging.getLogger(__name__)

line_bot_api = LineBotApi(os.getenv('LINE_BOT_TOKEN'))
handler = WebhookHandler(os.getenv('LINE_BOT_SECRET'))

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

    if isinstance(event, PostbackEvent):
        data = event.postback.data
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
                                "text": "請輸入關鍵字來搜索商品：",
                                "wrap": True,
                                "weight": "bold",
                                "size": "lg"
                            }
                        ]
                    }
                }
            )
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
    else:
        user_message = event.message.text
        logger.info("Message from user: %s", user_message)
        if user_message.startswith("搜尋 "):
            keyword = user_message[3:]
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
            
            if bubbles:  # Ensure bubbles list is not empty
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
            keyword = user_message
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

            if bubbles:  # Ensure bubbles list is not empty
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

def handle_postback(event, line_bot_api):
    data = event.postback.data
    if data.startswith("action=add_to_cart"):
        user_id = event.source.user_id
        product_id = data.split("&")[1].split("=")[1]
        add_to_cart(user_id, product_id, 1)
        try:
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=f"已加入購物車 {product_id}。"))
        except LineBotApiError as e:
            logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")
    elif data == 'action=one_buy':
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
                            "text": "請輸入關鍵字來搜尋商品： 例如 搜尋豬肉",
                            "wrap": True,
                            "weight": "bold",
                            "size": "lg"
                        }
                    ]
                }
            }
        )
        try:
            line_bot_api.reply_message(event.reply_token, flex_message)
        except LineBotApiError as e:
            logger.error(f"LineBotApiError: {e.status_code}, {e.error.message}, {e.error.details}")


@handler.add(PostbackEvent)
def handle_postback_event(event):
    handle_postback(event, line_bot_api)