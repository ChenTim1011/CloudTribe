from linebot.models import TextSendMessage

def handle_seller(event, line_bot_api):
    reply_message = TextSendMessage(text="賣家功能。")
    line_bot_api.reply_message(event.reply_token, reply_message)