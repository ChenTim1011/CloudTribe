from pydantic import BaseModel
from typing import List, Optional

class OrderItem(BaseModel):
    item_id: str
    item_name: str
    price: float
    quantity: int
    img: str

class Order(BaseModel):
    name: str
    phone: str
    date: str
    time: str
    location: str
    is_urgent: bool
    items: List[OrderItem]
    totalPrice: float
    order_type: str = '購買類'
    order_status: str = '未接單'
    note: Optional[str] = None
