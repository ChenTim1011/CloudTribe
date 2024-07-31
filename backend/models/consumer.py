from pydantic import BaseModel
from backend.models.seller import UploadItemRequest
class ProductInfo(UploadItemRequest):
    """
    the class extends UploadItemRequest:
    Model representing presented agricultural.
    """
    id: int
    uploadDate: str
    
class AddCartRequest(BaseModel):
    buyerId: str
    produceId: int
    quantity: int

class CartItem(BaseModel):
    id: int
    name: str
    imgUrl: str
    price: int
    quantity: int


