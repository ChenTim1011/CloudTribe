from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Driver(BaseModel):
    id: Optional[int] = None
    name: str 
    phone: str 
    direction: str
    available_date: str
    start_time: str
    end_time: str

class DriverOrder(BaseModel):
    driver_id: int
    order_id: int
    action: str
    timestamp: Optional[datetime] = None
