import json
import os
import logging
from linebot.models import FlexSendMessage, TemplateSendMessage, ButtonsTemplate, MessageAction, PostbackEvent

logger = logging.getLogger(__name__)

def handle_seller(event, line_bot_api):
    logger.info("Handling seller action")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, 'seller.json')

    # 讀取 JSON 檔案
    with open(json_path, 'r', encoding='utf-8') as f:
        flex_content = json.load(f)
    # 建立 Flex Message
    flex_message = FlexSendMessage(
        alt_text="賣家功能",
        contents=flex_content
    )

    # 回應 Flex Message
    line_bot_api.reply_message(event.reply_token, flex_message)