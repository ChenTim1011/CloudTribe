from sqlalchemy import Column, Integer, String, Float, Date, Boolean
from backend.database.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    category = Column(String, index=True)
    image = Column(String)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, index=True)
    date = Column(Date)
    time = Column(String)
    location = Column(String)
    is_urgent = Column(Boolean, default=False)
