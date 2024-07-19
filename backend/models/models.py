from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    item_id: str
    item_name: str
    price: float
    quantity: int
    img: str

class Order(BaseModel):
    buyer_id: int
    seller_id: int
    date: str
    time: str
    location: str
    is_urgent: bool
    items: List[OrderItem]
    total_price: float
    order_type: str = '購買類'
    order_status: str = '未接單'
    note: Optional[str] = None
    shipment_count: Optional[int] = None  # Number of drivers needed for shipment
    required_orders_count: Optional[int] = None  # Number of orders required for shipment
    previous_driver_id: Optional[int] = None
    previous_driver_name: Optional[str] = None
    previous_driver_phone: Optional[str] = None

class User(BaseModel):
    id: Optional[int] = None
    name: str
    phone: str

class Driver(BaseModel):
    user_id: int
    direction: Optional[str] = None
    available_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class DriverOrder(BaseModel):
    driver_id: int
    order_id: int
    action: str
    timestamp: Optional[datetime] = None
    previous_driver_id: Optional[int] = None
    previous_driver_name: Optional[str] = None
    previous_driver_phone: Optional[str] = None
