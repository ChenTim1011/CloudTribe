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
    location: Optional[str] = '家樂福'
    category: Optional[str] = '未分類'

class Order(BaseModel):
    id: Optional[int] = None 
    buyer_id: int
    buyer_name: str
    buyer_phone: str
    location: str
    is_urgent: bool
    total_price: float
    order_type: str = '購買類'
    order_status: str = '未接單'
    note: Optional[str] = None
    service: str
    items: List[OrderItem]
    timestamp: Optional[datetime] = None 

class DetailedOrder(Order):
    seller_id: int
    seller_name: str
    seller_phone: str
    date: str
    time: str
    shipment_count: Optional[int] = 1
    required_orders_count: Optional[int] = 1
    previous_driver_id: Optional[int] = None
    previous_driver_name: Optional[str] = None
    previous_driver_phone: Optional[str] = None



class Driver(BaseModel):
    """
    Model representing a driver.
    """
    id: Optional[int] = None 
    user_id: int
    driver_name: str
    driver_phone: str


class DriverTime(BaseModel):
    """
    Model representing a driver's time.
    """
    driver_id: int
    date: str
    start_time: str
    locations: str

class DriverTimeDetail(BaseModel):
    """
    Model representing a driver's time detail.
    """
    id: int
    date: str
    start_time: str
    locations: str
    driver_name: str
    driver_phone: str
    

class DriverOrder(BaseModel):
    """
    Model representing the association between a driver and an order.
    """
    driver_id: int
    order_id: int
    action: str
    timestamp: Optional[str] = None
    previous_driver_id: Optional[int] = None
    previous_driver_name: Optional[str] = None
    previous_driver_phone: Optional[str] = None
    service: str

class TransferOrderRequest(BaseModel):
    """
    Model representing a transfer order request.
    """
    current_driver_id: int
    new_driver_phone: str

class UploadImageRequset(BaseModel):
    img: str
    
class UploadImageResponse(BaseModel):
    """
    Model representing an image. 
    """
    imgId: str
    imgLink: str



class UploadItemRequest(BaseModel):
    """
    Model representing upload agricultural_product request.
    """
    name: str
    price: str
    category: str
    totalQuantity: str
    offShelfDate: str
    imgLink: str
    imgId: str
    ownerPhone: str


class ProductBasicInfo(BaseModel):
    id: str
    name: str
    uploadDate: str
    offShelfDate: str

class ProductInfo(UploadItemRequest):
    """
    the class extends UploadItemRequest:
    Model representing presented agricultural.
    """
    id: str
    uploadDate: str





