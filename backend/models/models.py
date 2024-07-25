"""
This module defines the Pydantic models used in the application.

It includes models for Order, OrderItem, User, Driver, and DriverOrder.
These models help in validating and serializing the data exchanged between the API and the database.
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class OrderItem(BaseModel):
    item_id: str
    item_name: str
    price: float
    quantity: int
    img: str

class Order(BaseModel):
    id: Optional[int] = None 
    buyer_id: int
    buyer_name: str
    buyer_phone: str
    seller_id: int
    seller_name: str
    seller_phone: str
    date: str
    time: str
    location: str
    is_urgent: bool
    total_price: float
    order_type: str = '購買類'
    order_status: str = '未接單'
    note: Optional[str] = None
    shipment_count: Optional[int] = 1
    required_orders_count: Optional[int] = 1
    previous_driver_id: Optional[int] = None
    previous_driver_name: Optional[str] = None
    previous_driver_phone: Optional[str] = None
    items: List[OrderItem]

class User(BaseModel):
    """
    Model representing a user.
    """
    id: Optional[int] = None
    name: str
    phone: str

class Driver(BaseModel):
    """
    Model representing a driver.
    """
    driver_name: str
    driver_phone: str
    direction: Optional[str] = None
    available_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class DriverOrder(BaseModel):
    """
    Model representing the association between a driver and an order.
    """
    driver_id: int
    order_id: int
    action: str
    timestamp: Optional[datetime] = None
    previous_driver_id: Optional[int] = None
    previous_driver_name: Optional[str] = None
    previous_driver_phone: Optional[str] = None

class TransferOrderRequest(BaseModel):
    """
    Model representing a transfer order request.
    """
    current_driver_id: int
    new_driver_phone: str

class Image(BaseModel):
    """
    Model representing an image. 
    """
    imgId: str
    imgLink: str
    
