"""
This module provides API endpoints for managing drivers and their orders.

It includes endpoints for creating, updating, and fetching driver information,
as well as fetching orders assigned to a driver.

Endpoints:
- POST /: Create a new driver.
- GET /{phone}: Get driver information by phone number.
- PATCH /{phone}: Update driver information by phone number.
- GET /{driver_id}/orders: Get orders assigned to a driver.

"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from backend.models.models import Driver
from backend.models.models import DriverTime
from backend.database import get_db_connection

router = APIRouter()

def get_db():
    """
    Dependency function to get a database connection.
    """
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

@router.post("/")
async def create_driver(driver: Driver, conn: Connection = Depends(get_db)):
    """
    Create a new driver.

    Args:
        driver (Driver): The driver information to create.
        conn (Connection): The database connection.

    Returns:
        dict: A success message.
    """
    cur = conn.cursor()
    try:
        cur.execute("SELECT driver_phone FROM drivers WHERE driver_phone = %s", (driver.driver_phone,))
        existing_driver = cur.fetchone()
        if existing_driver:
            raise HTTPException(status_code=409, detail="電話號碼已存在")
        cur.execute(
            "INSERT INTO drivers (driver_name, driver_phone, direction, available_date, start_time, end_time) VALUES (%s, %s, %s, %s, %s, %s)",
            (driver.driver_name,
             driver.driver_phone,
             driver.direction or None,
             driver.available_date or None,
             driver.start_time or None,
             driver.end_time or None)
        )
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        logging.error("Error creating driver: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get("/{phone}")
async def get_driver(phone: str, conn: Connection = Depends(get_db)):
    """
    Get driver information by phone number.

    Args:
        phone (str): The driver's phone number.
        conn (Connection): The database connection.

    Returns:
        dict: The driver information.
    """
    cur = conn.cursor()
    try:
        cur.execute("SELECT id,driver_name, driver_phone, direction, available_date, start_time, end_time FROM drivers WHERE driver_phone = %s", (phone,))
        driver = cur.fetchone()
        if not driver:
            raise HTTPException(status_code=404, detail="電話號碼未註冊")
        return {
            "id": driver[0],
            "driver_name": driver[1],
            "driver_phone": driver[2],
            "direction": driver[3] or None,
            "available_date": driver[4].isoformat() if driver[4] else None,
            "start_time": driver[5].isoformat() if driver[5] else None,
            "end_time": driver[6].isoformat() if driver[6] else None,
        }
    except Exception as e:
        logging.error("Error fetching driver: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.patch("/{phone}")
async def update_driver(phone: str, driver: Driver, conn: Connection = Depends(get_db)):
    """
    Update driver information by phone number.

    Args:
        phone (str): The driver's phone number.
        driver (Driver): The updated driver information.
        conn (Connection): The database connection.

    Returns:
        dict: A success message.
    """
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE drivers SET driver_name = %s, direction = %s, available_date = %s, start_time = %s, end_time = %s WHERE driver_phone = %s",
            (driver.driver_name, driver.direction, driver.available_date,
             driver.start_time, driver.end_time, phone)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Driver not found")
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        logging.error("Error updating driver: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get("/{driver_id}/orders")
async def get_driver_orders(driver_id: int, conn: Connection = Depends(get_db)):
    """
    Get orders assigned to a driver.

    Args:
        driver_id (int): The driver's ID.
        conn (Connection): The database connection.

    Returns:
        list: A list of orders assigned to the driver.
    """
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT orders.*, driver_orders.previous_driver_name, driver_orders.previous_driver_phone
            FROM orders 
            JOIN driver_orders ON orders.id = driver_orders.order_id 
            WHERE driver_orders.driver_id = %s AND driver_orders.action = '接單'
        """, (driver_id,))
        orders = cur.fetchall()
        order_list = []
        for order in orders:
            order_dict = {
                "id": order[0],
                "buyer_id": order[1],
                "buyer_name": order[2],
                "buyer_phone": order[3],
                "seller_id": order[4],
                "seller_name": order[5],
                "seller_phone": order[6],
                "date": order[7],
                "time": order[8],
                "location": order[9],
                "is_urgent": order[10],
                "total_price": order[11],
                "order_type": order[12],
                "order_status": order[13],
                "note": order[14],
                "shipment_count": order[15],
                "required_orders_count": order[16],
                "previous_driver_id": order[17],
                "previous_driver_name": order[18],
                "previous_driver_phone": order[19],
                "items": []
            }
            cur.execute("SELECT * FROM order_items WHERE order_id = %s", (order[0],))
            items = cur.fetchall()
            order_dict["items"] = [{"item_id": item[2], "item_name": item[3], "price": item[4],
                                    "quantity": item[5], "img": item[6]} for item in items]
            order_list.append(order_dict)
        
        return order_list
    except Exception as e:
        logging.error("Error fetching driver orders: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

# Add a new available time slot for a driver.
@router.post("/time")
async def add_driver_time(driver_time: DriverTime, conn: Connection = Depends(get_db)):
    """
    Add a new available time slot for a driver.

    Args:
        driver_time (DriverTime): The driver's time slot details 
        including driver ID, date, start time, and location.
        conn (Connection): The database connection.

    Returns:
        dict: A dictionary containing the newly created time slot ID and the success status.
    """
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO driver_time (driver_id, date, start_time, locations)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
            """,
            (driver_time.driver_id, driver_time.date, driver_time.start_time, driver_time.locations)
        )
        conn.commit()
        new_id = cur.fetchone()[0]
        return {"id": new_id, "status": "success"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

# Retrieve available time slots for a specific driver.
@router.get("/{driver_id}/times")
async def get_driver_times(driver_id: int, conn: Connection = Depends(get_db)):
    """
    Retrieve available time slots for a specific driver.

    Args:
        driver_id (int): The driver's ID.
        conn (Connection): The database connection.

    Returns:
        list: A list of dictionaries representing the available time slots for the driver. Each dictionary contains
              the time slot ID, date, start time, location, driver's name, and phone number.
    """

    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT dt.id, dt.date, dt.start_time, dt.locations, d.driver_name, d.driver_phone
            FROM driver_time dt
            JOIN drivers d ON dt.driver_id = d.id
            WHERE dt.driver_id = %s
            """,
            (driver_id,)
        )
        times = cur.fetchall()
        return [
            {
                "id": time[0],
                "date": time[1].isoformat(),
                "start_time": str(time[2]),
                "locations": time[3],
                "driver_name": time[4],
                "driver_phone": time[5]
            }
            for time in times
        ]
    except Exception as e:
        print(f"Error occurred: {e}") 
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()


# Delete an available time slot for a driver.
@router.delete("/time/{id}")
async def delete_driver_time(id: int, conn: Connection = Depends(get_db)):
    """
    Delete an available time slot for a driver.

    Args:
        id (int): The ID of the time slot to delete.
        conn (Connection): The database connection.

    Returns:
        dict: A dictionary containing the success status and a message indicating the deleted time slot ID.
    """
    cur = conn.cursor()
    try:
        cur.execute(
            """
            DELETE FROM driver_time
            WHERE id = %s
            """,
            (id,)
        )
        conn.commit()
        return {"status": "success", "message": f"Deleted time slot with ID {id}"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()