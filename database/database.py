# database.py
import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# 配置 Google Sheets API 認證
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name("account.json", scope)
client = gspread.authorize(creds)
GOOGLE_SHEETS_CREDENTIALS = os.getenv("GOOGLE_SHEETS_CREDENTIALS")

# 打開各個 Google Sheets 表格
YourGoogleSheetName="Orders"
users_sheet = client.open(YourGoogleSheetName).worksheet("Users")
products_sheet = client.open(YourGoogleSheetName).worksheet("Products")
cart_sheet = client.open(YourGoogleSheetName).worksheet("Cart")
orders_sheet = client.open(YourGoogleSheetName).worksheet("Orders")
order_items_sheet = client.open(YourGoogleSheetName).worksheet("Order_Items")

# 獲取所有記錄的函數
def get_all_records(sheet):
    return sheet.get_all_records()

# 添加一條記錄的函數
def add_record(sheet, record):
    sheet.append_row(record)

# 更新特定記錄的函數
def update_record(sheet, row, col, value):
    sheet.update_cell(row, col, value)

# 刪除特定記錄的函數
def delete_record(sheet, row):
    sheet.delete_row(row)

