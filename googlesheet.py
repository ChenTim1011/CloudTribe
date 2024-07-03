import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os
from dotenv import load_dotenv

# 加載環境變數
load_dotenv()

# Google Sheets API 憑證文件路徑
GOOGLE_SHEETS_CREDENTIALS = os.getenv("GOOGLE_SHEETS_CREDENTIALS")

# 認證和初始化gspread客戶端
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(GOOGLE_SHEETS_CREDENTIALS, scope)
client = gspread.authorize(creds)

# 列出所有可訪問的試算表
spreadsheets = client.openall()
print("Available spreadsheets:")
for sheet in spreadsheets:
    print(sheet.title)

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
        "expected_delivery": expected_delivery,
    }
    sheet.append_row(list(order_data.values()))

# 測試
if __name__ == "__main__":
    # 添加測試訂單
    add_order("12345", "進行中", "2024-07-15")
    # 獲取所有訂單
    orders = get_all_orders()
    print(orders)
