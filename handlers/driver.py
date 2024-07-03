from linebot.models import TextSendMessage
import logging
def handle_driver(event, line_bot_api):
    logger.info("Handling driver action")
    reply_message = TextSendMessage(text="司機功能。")
    line_bot_api.reply_message(event.reply_token, reply_message)
from linebot.models import TextSendMessage



