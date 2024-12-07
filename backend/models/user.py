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
    is_driver: Optional[bool] = False  #bool
    line_user_id: Optional[str] = None 
class UpdateLocationRequest(BaseModel):
    location: str

class LineBindingRequest(BaseModel):
    """
    Request model for LINE account binding
    """
    user_id: int
    line_user_id: str

