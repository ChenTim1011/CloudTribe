"""
This module provides functions for interacting with the database.
"""

from sqlalchemy.orm import Session
from backend.database import models
from backend.database import schemas

def get_item(db: Session, item_id: int):
    """
    Retrieve an item from the database by its ID.

    Args:
        db (Session): The database session.
        item_id (int): The ID of the item to retrieve.

    Returns:
        Item: The retrieved item, or None if no item with the given ID exists.
    """
    return db.query(models.Item).filter(models.Item.id == item_id).first()

def get_items(db: Session, skip: int = 0, limit: int = 10):
    """
    Retrieve a list of items from the database.

    Args:
        db (Session): The database session.
        skip (int, optional): Number of items to skip. Defaults to 0.
        limit (int, optional): Maximum number of items to retrieve. Defaults to 10.

    Returns:
        List[Item]: A list of items retrieved from the database.
    """
    return db.query(models.Item).offset(skip).limit(limit).all()

def create_item(db: Session, item: schemas.ItemCreate):
    """
    Create a new item in the database.

    Parameters:
    - db (Session): The database session.
    - item (ItemCreate): The item data to be created.

    Returns:
    - db_item (Item): The created item in the database.
    """
    db_item = models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def create_order(db: Session, order: schemas.OrderCreate):
    db_order = models.Order(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order