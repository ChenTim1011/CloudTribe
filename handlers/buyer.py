from linebot.models import TextSendMessage, QuickReply, QuickReplyButton, MessageAction

def handle_buyer(event, line_bot_api):
    reply_message = TextSendMessage(
        text="請選擇操作",
        quick_reply=QuickReply(items=[
            QuickReplyButton(action=MessageAction(label="輸入日期時間", text="輸入日期時間")),
            QuickReplyButton(action=MessageAction(label="輸入最晚取消時間", text="輸入最晚取消時間")),
            QuickReplyButton(action=MessageAction(label="選擇取貨地點", text="選擇取貨地點")),
            QuickReplyButton(action=MessageAction(label="選擇購買物品", text="選擇購買物品")),
        ])
    )
    line_bot_api.reply_message(event.reply_token, reply_message)
