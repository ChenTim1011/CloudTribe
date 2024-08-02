from pydantic import BaseModel
from backend.models.seller import UploadItemRequest
class ProductInfo(UploadItemRequest):
    """
    the class extends UploadItemRequest:
    Model representing presented agricultural.
    """
    id: int
    upload_date: str
    
class AddCartRequest(BaseModel):
    buyer_id: str
    produce_id: int
    quantity: int

class CartItem(BaseModel):
    id: int
    name: str
    img_url: str
    price: int
    quantity: int

class UpdateCartQuantityRequest(BaseModel):
    quantity: int

class PurchaseProductRequest(BaseModel):
    seller_id: int
    buyer_id: int
    buyer_name: str
    produce_id: int
    quantity: int
    starting_point: str
    end_point: str
    category: str #agriculture or necessity


