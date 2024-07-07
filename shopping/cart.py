from database.database import add_record, get_all_records, delete_record, cart_sheet

def add_to_cart(user_id, product_id, quantity):
    record = [user_id, product_id, quantity]
    add_record(cart_sheet, record)
    return "已加入購物車。"

def view_cart(user_id):
    records = get_all_records(cart_sheet)
    user_cart = [record for record in records if record['user_id'] == user_id]
    if not user_cart:
        return "您的購物車是空的。"
    return user_cart

def checkout(user_id):
    records = get_all_records(cart_sheet)
    user_cart = [record for record in records if record['user_id'] == user_id]
    if not user_cart:
        return "您的購物車是空的。"
    
    total_price = sum(int(record['quantity']) for record in user_cart)  # 簡單計算價格，實際應考慮單價
    order = {"user_id": user_id, "total_price": total_price, "items": user_cart}
    
    for record in user_cart:
        delete_record(cart_sheet, int(record['row']))  # 刪除購物車中的項目
    
    return order
