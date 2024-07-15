from pydantic import BaseModel
from datetime import date

class ItemBase(BaseModel):
    name: str
    price: float
    category: str
    image: str

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    name: str
    phone: str
    date: date
    time: str
    location: str
    is_urgent: bool = False

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int

    class Config:
        orm_mode = True
