from linebot.models import TextSendMessage, QuickReply, QuickReplyButton, MessageAction
from dotenv import load_dotenv

# 加載環境變數
load_dotenv()


def handle_order_query(event, line_bot_api):
    user_message = event.message.text

    if user_message in ["訂單資訊", "訂單查詢", "訂單", "查詢"]:
        reply_message = TextSendMessage(
            text="請選擇您的角色：",
            quick_reply=QuickReply(items=[
                QuickReplyButton(action=MessageAction(label="賣家", text="賣家")),
                QuickReplyButton(action=MessageAction(label="買家", text="買家")),
                QuickReplyButton(action=MessageAction(label="司機", text="司機"))
            ])
        )
        line_bot_api.reply_message(event.reply_token, reply_message)
        return

    # Step 2: After role selection, handle order queries
    role = None
    if user_message in ["賣家", "買家", "司機"]:
        role = user_message
        reply_message = TextSendMessage(
            text=f"您是{role}，請選擇查詢的訂單類型：",
            quick_reply=QuickReply(items=[
                QuickReplyButton(action=MessageAction(label="進行中的訂單", text="進行中的訂單")),
                QuickReplyButton(action=MessageAction(label="處理中的訂單", text="處理中的訂單")),
                QuickReplyButton(action=MessageAction(label="已完成的訂單", text="已完成的訂單")),
            ])
        )
        line_bot_api.reply_message(event.reply_token, reply_message)
        return