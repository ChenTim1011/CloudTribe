from linebot.models import TextSendMessage

def handle_platform_info(event, line_bot_api):
    reply_message = TextSendMessage(text="這是平台介紹。")
    line_bot_api.reply_message(event.reply_token, reply_message)
