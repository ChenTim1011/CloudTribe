"""
This module defines the Pydantic models used in the application.

It includes models for UploadImage,.
These models help in validating and serializing the data exchanged between the API and the database.
"""
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
    Model representing upload agricultural product request.
    """
    name: str
    price: str
    category: str
    total_quantity: str
    off_shelf_date: str
    img_link: str
    img_id: str
    seller_id: str

class ProductBasicInfo(BaseModel):
    id: int
    name: str
    upload_date: str
    off_shelf_date: str


