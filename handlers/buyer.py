import json
import os
import logging
from linebot.models import FlexSendMessage, TextSendMessage, BubbleContainer, BoxComponent, TextComponent, ButtonComponent, URIAction
from shopping.search import search_products
from shopping.cart import add_to_cart, view_cart, checkout

logger = logging.getLogger(__name__)

def handle_buyer(event, line_bot_api):
    user_id = event.source.user_id
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
                        )
                    ]
                )
            )
            bubbles.append(bubble)
        message = FlexSendMessage(alt_text="商品列表", contents={"type": "carousel", "contents": bubbles})
        line_bot_api.reply_message(event.reply_token, message)
    elif user_message == "查看購物車":
        cart_content = view_cart(user_id)
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=str(cart_content)))
    elif user_message.startswith("加入購物車"):
        product_id = user_message.split(' ')[2]
        add_to_cart(user_id, product_id, 1)
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=f"已加入購物車 {product_id}。"))
    elif user_message == "結帳":
        order = checkout(user_id)
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=f"您的訂單已提交: {order}"))
    else:
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text="請使用 '搜尋 [關鍵字]', '加入購物車 [商品ID]', '查看購物車', 或 '結帳'。"))
