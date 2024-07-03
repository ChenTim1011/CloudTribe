import json
import os
import logging
from linebot.models import FlexSendMessage, TemplateSendMessage, ButtonsTemplate, MessageAction, PostbackEvent

logger = logging.getLogger(__name__)

def handle_driver(event, line_bot_api):
    logger.info("Handling driver action")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, 'driver_flex_message.json')

    # 讀取 JSON 檔案
    with open(json_path, 'r', encoding='utf-8') as f:
        flex_content = json.load(f)
    # 建立 Flex Message
    flex_message = FlexSendMessage(
        alt_text="司機功能",
        contents=flex_content
    )

    # 回應 Flex Message
    line_bot_api.reply_message(event.reply_token, flex_message)

def handle_set_conditions(event, line_bot_api):
    # 設定條件的表單
    buttons_template = TemplateSendMessage(
        alt_text="設定條件",
        template=ButtonsTemplate(
            title="設定條件",
            text="請選擇要設定的條件",
            actions=[
                MessageAction(
                    label="設定方向",
                    text="設定方向"
                ),
                MessageAction(
                    label="設定時間",
                    text="設定時間"
                ),
                MessageAction(
                    label="設定最晚回程時間",
                    text="設定最晚回程時間"
                )
            ]
        )
    )
    line_bot_api.reply_message(event.reply_token, buttons_template)
