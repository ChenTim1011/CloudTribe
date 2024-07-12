from linebot.models import TextSendMessage, QuickReply, QuickReplyButton, URIAction




def handle_customer_service(event, line_bot_api):
    user_message = event.message.text
    if user_message in ["客服", "詢問客服", "詢問"]:
        reply_message = TextSendMessage(
            text="加入客服的Line，我們有專員替您服務：",
            quick_reply=QuickReply(items=[
                QuickReplyButton(action=URIAction(label="加入客服LINE", uri="https://line.me/ti/p/ydwA4hVzo1")),
            ])
        )
        line_bot_api.reply_message(event.reply_token, reply_message)