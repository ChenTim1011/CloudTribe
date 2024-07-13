"""
This module contains the schemas for the database.
"""

from pydantic import BaseModel

class ItemBase(BaseModel):
    """
    Base class for an item.
    """
    name: str
    price: float
    category: str
    image: str

class ItemCreate(ItemBase):
    """
    Class for creating an item.
    """

class Item(ItemBase):
    """
    Class representing an item.
    """
    id: int

    class Config:
        """
        Configuration class for Item.
        """
        from_attributes=True
        def method1(self):
            """
            Method 1 description.
            """


        def method2(self):
            """
            Method 2 description.
            """
       
