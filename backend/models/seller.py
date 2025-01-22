"""
This module defines the Pydantic models used in the application.

It includes models for UploadImage,.
These models help in validating and serializing the data exchanged between the API and the database.
"""
from typing import List
from pydantic import BaseModel

class UploadImageRequset(BaseModel):
    img: str
    
class UploadImageResponse(BaseModel):
    """
    Model representing an image. 
    """
    img_id: str
    img_link: str
class UploadItemRequest(BaseModel):
    """
    Model representing upload agricultural_product request.
    """
    name: str
    price: str
    category: str
    total_quantity: str
    off_shelf_date: str
    img_link: str
    img_id: str
    seller_id: int
    unit: str
    location: str #location where item will be put

class ProductBasicInfo(BaseModel):
    id: int
    name: str
    upload_date: str
    off_shelf_date: str
class ProductInfo(BaseModel):
    id: int
    name: str
    price: int
    category: str
    total_quantity: int
    upload_date: str
    off_shelf_date: str
    img_link: str
    img_id: str
    unit: str

class ProductOrderInfo(BaseModel):
    order_id: int
    buyer_name: str
    quantity: int
    product_price: int
    status: str
    timestamp: str
    is_put: bool

class IsPutRequest(BaseModel):
    order_ids:List[int]

class UpdateOffShelfDateRequest(BaseModel):
    date: str

    




