from pydantic import BaseModel

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
        from_attributes=True
