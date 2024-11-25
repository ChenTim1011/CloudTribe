# backend/handlers/customer_service.py

from linebot.v3.messaging import (
    TextMessage,
    QuickReply,
    URIAction,
    QuickReplyItem,
    ReplyMessageRequest
)
import logging

logger = logging.getLogger(__name__)

def handle_customer_service(event, line_bot_api):
    user_message = event.message.text
    if user_message in ["客服", "詢問客服", "詢問"]:
        try:
            reply_message = TextMessage(
                text="加入客服的Line，我們有專員替您服務：",
                quick_reply=QuickReply(items=[
                    QuickReplyItem(action=URIAction(label="加入客服LINE", uri="https://line.me/ti/p/ydwA4hVzo1")),
                ])
            )
            reply_request = ReplyMessageRequest(
                reply_token=event.reply_token,
                reply_message=reply_message
            )
            line_bot_api.reply_message(reply_request)
            logger.info("客服回應已發送")
        except Exception as e:
            logger.exception("發送客服回應時發生異常: %s", e)
