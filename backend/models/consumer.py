from pydantic import BaseModel
class ProductInfo(BaseModel):
    """
    the class extends UploadItemRequest:
    Model representing presented agricultural.
    """
    id: int
    name: str
    price: str
    category: str
    total_quantity: str
    off_shelf_date: str
    img_link: str
    img_id: str
    seller_id: int
    unit: str
    upload_date: str
    
class AddCartRequest(BaseModel):
    buyer_id: int
    produce_id: int
    quantity: int

class CartItem(BaseModel):
    id: int
    produce_id: int
    name: str
    img_url: str
    price: int
    quantity: int
    seller_id: int
    unit: str

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

class PurchasedProduct(BaseModel):
    order_id: int
    quantity: int
    timestamp: str
    product_name: str
    product_price: int
    img_url: str
    status: str
    unit: str




