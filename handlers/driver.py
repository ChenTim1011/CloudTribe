from linebot.models import FlexSendMessage, BubbleContainer, BoxComponent, TextComponent, ButtonComponent, PostbackAction, TemplateSendMessage, ButtonsTemplate, MessageAction
import logging
logger = logging.getLogger(__name__)

from linebot.models import FlexSendMessage
import logging

logger = logging.getLogger(__name__)

def handle_driver(event, line_bot_api):
    logger.info("Handling driver action")

    # 建立 Flex Message
    flex_message = FlexSendMessage(
        alt_text="司機功能選項",
        contents={
            "type": "bubble",
            "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                {
                    "type": "text",
                    "text": "司機功能選項",
                    "weight": "bold",
                    "size": "xl",
                    "align": "center",
                    "color": "#000000"
                }
                ],
                "backgroundColor": "#EFEFEF"
            },
            "hero": {
                "type": "image",
                "url": "https://upload.wikimedia.org/wikipedia/commons/e/e7/%E9%9B%AA%E9%9C%A7%E9%AC%A7%E9%83%A8%E8%90%BD%E6%99%AF%E8%89%B2.jpg",
                "size": "full",
                "aspectRatio": "20:13",
                "aspectMode": "cover",
                "backgroundColor": "#000000"
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "md",
                "contents": [
                {
                    "type": "button",
                    "action": {
                    "type": "postback",
                    "label": "查詢訂單",
                    "data": "action=query_order",
                    "displayText": "查詢訂單"
                    },
                    "style": "primary",
                    "color": "#00BFFF"
                },
                {
                    "type": "button",
                    "action": {
                    "type": "postback",
                    "label": "設定條件",
                    "data": "action=set_conditions",
                    "displayText": "設定條件"
                    },
                    "style": "primary",
                    "color": "#00BFFF"
                }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "horizontal",
                "spacing": "sm",
                "contents": [
                {
                    "type": "button",
                    "action": {
                    "type": "uri",
                    "label": "官方網站",
                    "uri": "https://www.youtube.com/c/LINEDevelopersTaiwan/videos"
                    },
                    "style": "link"
                },
                {
                    "type": "button",
                    "action": {
                    "type": "uri",
                    "label": "分享",
                    "uri": "https://www.facebook.com/LINEDevelopersTW"
                    },
                    "style": "link"
                }
                ],
                "flex": 0
            }
            }
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
