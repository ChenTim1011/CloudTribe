from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import MessageEvent, TextMessage, TextSendMessage
import google.generativeai as genai
import os
import json

app = FastAPI()

# 設定你的Channel Secret和Access Token
line_bot_api = LineBotApi(os.getenv('LINE_BOT_TOKEN'))
handler = WebhookHandler(os.getenv('LINE_BOT_SECRET'))

# 設定Gemini API Key
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

@app.post("/callback")
async def callback(request: Request):
    signature = request.headers['X-Line-Signature']
    body = await request.body()
    body = body.decode('utf-8')

    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    return 'OK'

@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    user_message = event.message.text
    response_message = get_gemini_response(user_message)
    line_bot_api.reply_message(
        event.reply_token,
        TextSendMessage(text=response_message)
    )

def get_gemini_response(message: str) -> str:
    model = genai.GenerativeModel('gemini-pro')
    messages = [{'role': 'user', 'parts': [message]}]
    response = model.generate_content(messages)
    return response.text

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
