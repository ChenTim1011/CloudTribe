from linebot.models import TextSendMessage, QuickReply, QuickReplyButton, MessageAction
import google.generativeai as genai
import os

def handle_customer_service(event, line_bot_api):
    user_message = event.message.text
    if user_message in ["客服", "詢問客服", "詢問"]:
        reply_message = TextSendMessage(
            text="AI 還是 真人？",
            quick_reply=QuickReply(items=[
                QuickReplyButton(action=MessageAction(label="AI", text="AI")),
                QuickReplyButton(action=MessageAction(label="真人", text="真人")),
            ])
        )
    elif user_message == "AI":
        response_message = get_gemini_response("請問需要什麼幫助？")
        reply_message = TextSendMessage(text=response_message)
    elif user_message == "真人":
        reply_message = TextSendMessage(
            text="請選擇客服人員：",
            quick_reply=QuickReply(items=[
                QuickReplyButton(action=MessageAction(label="客服A", text="客服A")),
                QuickReplyButton(action=MessageAction(label="客服B", text="客服B")),
                QuickReplyButton(action=MessageAction(label="客服C", text="客服C")),
            ])
        )
    elif user_message in ["客服A", "客服B", "客服C"]:
        reply_message = TextSendMessage(text=f"你可以聯絡 {user_message}，他的Line帳號是 @example123")
    else:
        reply_message = TextSendMessage(text="未知的操作。")
    
    line_bot_api.reply_message(event.reply_token, reply_message)

def get_gemini_response(message: str) -> str:
    model = genai.GenerativeModel('gemini-pro')
    messages = [{'role': 'user', 'parts': [message]}]
    response = model.generate_content(messages)
    return response.text