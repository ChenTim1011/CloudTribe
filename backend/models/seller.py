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
    imgId: str
    imgLink: str
class UploadItemRequest(BaseModel):
    """
    Model representing upload agricultural product request.
    """
    name: str
    price: str
    category: str
    totalQuantity: str
    offShelfDate: str
    imgLink: str
    imgId: str
    sellerId: str

class ProductBasicInfo(BaseModel):
    id: int
    name: str
    uploadDate: str
    offShelfDate: str

class ProductInfo(UploadItemRequest):
    """
    the class extends UploadItemRequest:
    Model representing presented agricultural.
    """
    id: int
    uploadDate: str

