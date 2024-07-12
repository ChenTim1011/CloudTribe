import os
import logging
from linebot.models import (
    FlexSendMessage
)
from linebot import LineBotApi, WebhookHandler

logger = logging.getLogger(__name__)

line_bot_api = LineBotApi(os.getenv('LINE_BOT_TOKEN'))
handler = WebhookHandler(os.getenv('LINE_BOT_SECRET'))


def handle_buyer(event, line_bot_api):

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
                            "uri": "https://www.google.com/" # Put your shopping page URL here
                        }, 
                        "style": "primary",
                        "color": "#1DB446"
                    }
                ]
            }
        }
    )
    line_bot_api.reply_message(event.reply_token, flex_message)