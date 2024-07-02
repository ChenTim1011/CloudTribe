from linebot.models import TextSendMessage

def handle_order_query(event, line_bot_api):
    reply_message = TextSendMessage(text="查詢訂單功能。")
    line_bot_api.reply_message(event.reply_token, reply_message)
