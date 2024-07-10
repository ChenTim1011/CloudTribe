from linebot.models import TextSendMessage, QuickReply, QuickReplyButton, MessageAction, FlexSendMessage
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os
from dotenv import load_dotenv
from dataclasses import dataclass

# 加載環境變數
load_dotenv()

# Google Sheets API 憑證文件路徑
GOOGLE_SHEETS_CREDENTIALS = os.getenv("GOOGLE_SHEETS_CREDENTIALS")

# 檢查變數是否正確設置
if not GOOGLE_SHEETS_CREDENTIALS:
    raise ValueError("The GOOGLE_SHEETS_CREDENTIALS environment variable is not set or empty.")

# 認證和初始化gspread客戶端
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(GOOGLE_SHEETS_CREDENTIALS, scope)
client = gspread.authorize(creds)

# 打開Google Sheets
spreadsheet = client.open("Orders")
sheet = spreadsheet.sheet1

# 獲取所有訂單
def get_all_orders():
    orders = sheet.get_all_records()
    return orders

# 添加新訂單
def add_order(order_number, status, expected_delivery):
    order_data = {
        "order_number": order_number,
        "status": status,
        "expected_delivery": expected_delivery
    }
    sheet.append_row(list(order_data.values()))

def get_orders_by_status(status):
    orders = get_all_orders()
    return [order for order in orders if order['status'] == status]

def get_order_carousel(orders, status):
    title = {
        "進行中的訂單": "In-progress Orders",
        "已完成的訂單": "Completed Orders",
        "處理中的訂單": "Processing Orders"
    }.get(status, "Orders")
    
    bubbles = []
    for order in orders:
        bubble = {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                    {
                        "type": "text",
                        "text": f"Order #{order['order_number']}",
                        "wrap": True,
                        "weight": "bold",
                        "size": "xl"
                    },
                    {
                        "type": "text",
                        "text": f"Status: {order['status']}",
                        "wrap": True,
                        "size": "md"
                    },
                    {
                        "type": "text",
                        "text": f"Expected Delivery: {order['expected_delivery']}",
                        "wrap": True,
                        "size": "md"
                    }
                ]
            }
        }
        bubbles.append(bubble)

    carousel = {
        "type": "carousel",
        "contents": bubbles
    }
    
    return FlexSendMessage(alt_text=title, contents=carousel)

@dataclass
class UserState:
    step: str
    order_number: str = ""
    status: str = ""
    expected_delivery: str = ""

# 使用者狀態存儲
user_states: dict[str, UserState] = {}

def handle_order_query(event, line_bot_api):
    user_message = event.message.text
    user_id = event.source.user_id

    # 檢查用戶狀態
    if user_id in user_states:
        user_state = user_states[user_id]

        if user_state.step == 'awaiting_order_number':
            user_state.order_number = user_message
            user_state.step = 'awaiting_status'
            reply_message = TextSendMessage(text="請輸入訂單狀態（進行中、已完成、處理中）：")
            line_bot_api.reply_message(event.reply_token, reply_message)
            return

        elif user_state.step == 'awaiting_status':
            user_state.status = user_message
            user_state.step = 'awaiting_expected_delivery'
            reply_message = TextSendMessage(text="請輸入預期交付日期（YYYY-MM-DD）：")
            line_bot_api.reply_message(event.reply_token, reply_message)
            return

        elif user_state.step == 'awaiting_expected_delivery':
            user_state.expected_delivery = user_message
            add_order(
                user_state.order_number,
                user_state.status,
                user_state.expected_delivery
            )
            del user_states[user_id]
            reply_message = TextSendMessage(text="訂單已成功添加！")
            line_bot_api.reply_message(event.reply_token, reply_message)
            return

    # Step 1: Determine user role
    if user_message in ["訂單資訊", "訂單查詢", "訂單", "查詢"]:
        reply_message = TextSendMessage(
            text="請選擇您的角色：",
            quick_reply=QuickReply(items=[
                QuickReplyButton(action=MessageAction(label="賣家", text="賣家")),
                QuickReplyButton(action=MessageAction(label="買家", text="買家")),
                QuickReplyButton(action=MessageAction(label="司機", text="司機")),
                QuickReplyButton(action=MessageAction(label="新增訂單", text="新增訂單"))
            ])
        )
        line_bot_api.reply_message(event.reply_token, reply_message)
        return

    if user_message == "新增訂單":
        user_states[user_id] = UserState(step='awaiting_order_number')
        reply_message = TextSendMessage(text="請輸入訂單號：")
        line_bot_api.reply_message(event.reply_token, reply_message)
        return

    # Step 2: After role selection, handle order queries
    role = None
    if user_message in ["賣家", "買家", "司機"]:
        role = user_message
        reply_message = TextSendMessage(
            text=f"您是{role}，請選擇查詢的訂單類型：",
            quick_reply=QuickReply(items=[
                QuickReplyButton(action=MessageAction(label="進行中的訂單", text="進行中的訂單")),
                QuickReplyButton(action=MessageAction(label="處理中的訂單", text="處理中的訂單")),
                QuickReplyButton(action=MessageAction(label="已完成的訂單", text="已完成的訂單")),
            ])
        )
        line_bot_api.reply_message(event.reply_token, reply_message)
        return

    # Step 3: Handle specific order type queries
    if user_message in ["進行中的訂單", "已完成的訂單", "處理中的訂單"]:
        orders = get_orders_by_status(user_message)
        if orders:
            carousel_message = get_order_carousel(orders, user_message)
            line_bot_api.reply_message(event.reply_token, carousel_message)
        else:
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text="沒有找到相關訂單。"))
    else:
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text="未知的訂單操作。"))
