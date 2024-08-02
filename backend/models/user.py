from pydantic import BaseModel
from typing import Optional
class User(BaseModel):
    """
    Model representing a user.
    """
    id: Optional[int] = None
    name: str
    phone: str
    location: Optional[str] = None #str
class UpdateLocationRequest(BaseModel):
    location: str

