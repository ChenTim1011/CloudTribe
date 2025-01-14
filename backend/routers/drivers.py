"""
This module provides API endpoints for managing drivers and their orders.

It includes endpoints for creating, updating, and fetching driver information,
as well as fetching orders assigned to a driver.

Endpoints:
- POST /: Create a new driver.
- GET /user/{user_id}: Get driver information by user ID.
- GET /{driver_id}: Get driver information by driver ID.
- GET /{driver_id}/orders: Get orders assigned to a driver.
- POST /time: Add a new available time slot for a driver.
- GET /all/times: Retrieve available time slots for all driver.
- GET /{driver_id}/times: Retrieve available time slots for a specific driver.
- DELETE /time/{id}: Delete an available time slot for a driver.
- DELETE /drop_agricultural_order/{driver_id}/{order_id}:Delete received agricultural product order.
"""

import logging
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from backend.models.models import Driver
from backend.models.models import DriverTime, DriverTimeDetail
from backend.database import get_db_connection
from typing import List
import os 

router = APIRouter()

log_dir = os.path.join(os.getcwd(), 'backend', 'logs')

if not os.path.exists(log_dir):
    os.makedirs(log_dir)

log_file = os.path.join(log_dir, 'drivers.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler(log_file), logging.StreamHandler()]
)

logger = logging.getLogger(__name__)

def log_event(event_type: str, data: dict):
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "data": data
    }
    logger.info(json.dumps(log_data))

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
    log_event("DRIVER_REGISTRATION_STARTED", {
        "user_id": driver.user_id,
        "driver_name": driver.driver_name,
        "driver_phone": driver.driver_phone
    })

    cur = conn.cursor()
    try:
        # Check if user_id exists
        cur.execute("SELECT id FROM users WHERE id = %s", (driver.user_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="使用者不存在")

        # Check if the user is already a driver
        cur.execute("SELECT id FROM drivers WHERE user_id = %s", (driver.user_id,))
        existing_driver = cur.fetchone()
        if existing_driver:
            raise HTTPException(status_code=409, detail="使用者已經是司機")

        # Check if driver_phone already exists
        cur.execute("SELECT id FROM drivers WHERE driver_phone = %s", (driver.driver_phone,))
        phone_exists = cur.fetchone()
        if phone_exists:
            raise HTTPException(status_code=409, detail="電話號碼已存在")

        # Insert the new driver
        cur.execute(
            """
            INSERT INTO drivers (user_id, driver_name, driver_phone)
            VALUES (%s, %s, %s)
            RETURNING id;
            """,
            (
                driver.user_id,
                driver.driver_name,
                driver.driver_phone,
            )
        )
        new_driver_id = cur.fetchone()[0]
        conn.commit()
        log_event("DRIVER_REGISTERED", {
            "driver_id": new_driver_id,
            "user_id": driver.user_id,
            "status": "success"
        })
        return {"status": "success", "driver_id": new_driver_id}
    except HTTPException as he:
        conn.rollback()
        raise he
    except Exception as e:
        conn.rollback()
        log_event("DRIVER_REGISTRATION_ERROR", {
            "user_id": driver.user_id,
            "error": str(e)
        })
        raise HTTPException(status_code=500, detail="伺服器內部錯誤") from e
    finally:
        cur.close()

@router.get("/user/{user_id}")
async def get_driver_by_user(user_id: int, conn: Connection = Depends(get_db)):
    """
    Get driver information by user ID.

    Args:
        user_id (int): The user's ID.
        conn (Connection): The database connection.

    Returns:
        dict: The driver information.
    """
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT id, user_id, driver_name, driver_phone
            FROM drivers
            WHERE user_id = %s
            """,
            (user_id,)
        )
        driver = cur.fetchone()
        if not driver:
            raise HTTPException(status_code=404, detail="該使用者不是司機或不存在")

        

        return {
            "id": driver[0],
            "user_id": driver[1],
            "driver_name": driver[2],
            "driver_phone": driver[3],
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error("Error fetching driver by user: %s", str(e))
        raise HTTPException(status_code=500, detail="伺服器內部錯誤") from e
    finally:
        cur.close()

@router.get("/{driver_id}")
async def get_driver_by_id(driver_id: int, conn: Connection = Depends(get_db)):
    """
    Get driver information by driver ID.

    Args:
        driver_id (int): The driver's ID.
        conn (Connection): The database connection.

    Returns:
        dict: The driver information.
    """
    cur = conn.cursor()
    try:
        # Check if driver_id exists in the database
        cur.execute(
            """
            SELECT id, user_id, driver_name, driver_phone
            FROM drivers
            WHERE id = %s
            """,
            (driver_id,)
        )
        driver = cur.fetchone()
        
        # Check if driver exists
        if not driver:
            raise HTTPException(status_code=404, detail="該司機不存在")

        # Return driver information
        return {
            "id": driver[0],
            "user_id": driver[1],
            "driver_name": driver[2],
            "driver_phone": driver[3],
        }
    except Exception as e:
        logging.error("Error fetching driver by ID: %s", str(e))
        raise HTTPException(status_code=500, detail="伺服器內部錯誤") from e
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
        # Check if driver_id exists
        cur.execute("SELECT id FROM drivers WHERE id = %s", (driver_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="司機不存在")

        # Retrieve accepted orders
        cur.execute("""
            SELECT orders.*, driver_orders.previous_driver_name, driver_orders.previous_driver_phone
            FROM orders 
            JOIN driver_orders ON orders.id = driver_orders.order_id 
            WHERE driver_orders.driver_id = %s and driver_orders.service = %s 
        """, (driver_id, 'necessities'))
        orders = cur.fetchall()
        order_list = []
        for order in orders:
            order_dict = {
                "id": order[0],
                "buyer_id": order[1],
                "buyer_name": order[2],
                "buyer_phone": order[3],
                #"seller_id": order[4], # no
                #"seller_name": order[5], # no
                #"seller_phone": order[6], # no
                #"date": order[7].isoformat(), # no
                #"time": order[8].isoformat(), # no
                "location": order[9],
                "is_urgent": order[10], # optional(or default false) 
                "total_price": order[11],
                "order_type": order[12],
                "order_status": order[13],
                "note": order[14],
                #"shipment_count": order[15], # no
                #"required_orders_count": order[16], # no
                "previous_driver_id": order[17],
                "previous_driver_name": order[18],
                "previous_driver_phone": order[19],
                "service":"necessities",
                "items": [],
                "timestamp": order[20]
            }
            # Retrieve order items
            cur.execute("SELECT item_id, item_name, price, quantity, img, location, category FROM order_items WHERE order_id = %s", (order[0],))
            items = cur.fetchall()
            order_dict["items"] = [
                {
                    "item_id": item[0],
                    "item_name": item[1],
                    "price": item[2],
                    "quantity": item[3],
                    "img": item[4],
                    "location": item[5],
                    "category": item[6]
                }
                for item in items
            ]
            order_list.append(order_dict)

        #add
        cur.execute("""
            SELECT agri_p_o.id, agri_p_o.buyer_id, agri_p_o.buyer_name, agri_p_o.buyer_phone, agri_p_o.end_point, agri_p_o.status, agri_p_o.note, 
                    driver_o.previous_driver_id, driver_o.previous_driver_name, driver_o.previous_driver_phone, 
                    agri_p.id, agri_p.name, agri_p.price, agri_p_o.quantity, agri_p.img_link, agri_p_o.starting_point, agri_p.category, agri_p_o.timestamp
            FROM agricultural_product_order as agri_p_o
            JOIN driver_orders as driver_o ON agri_p_o.id = driver_o.order_id
            JOIN agricultural_produce as agri_p on agri_p.id = agri_p_o.produce_id
            WHERE driver_o.driver_id = %s and driver_o.service = %s 
        """, (driver_id, 'agricultural_product'))
        agri_orders = cur.fetchall()
        for agri_order in agri_orders:
            total_price = agri_order[12] * agri_order[13] #price*quantity
            agri_order_dict = {
                "id": agri_order[0],
                "buyer_id": agri_order[1],
                "buyer_name": agri_order[2],
                "buyer_phone": agri_order[3],
                "location":agri_order[4], #商品要送達的目的地
                "is_urgent": False, # optional(or default false) 
                "total_price": total_price,
                "order_type": '購買類',
                "order_status": agri_order[5], #未接單、已接單、已送達
                "note": agri_order[6],
                "previous_driver_id": agri_order[7],
                "previous_driver_name": agri_order[8],
                "previous_driver_phone": agri_order[9],
                "service":'agricultural_product',
                "items": [{
                    "item_id": agri_order[10],
                    "item_name": agri_order[11],
                    "price": agri_order[12],
                    "quantity": agri_order[13],
                    "img": agri_order[14],
                    "location": agri_order[15], #司機拿取農產品的地方
                    "category": agri_order[16]
                }],
                "timestamp":agri_order[17]
            }
            order_list.append(agri_order_dict)
        return order_list
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error("Error fetching driver orders: %s", str(e))
        raise HTTPException(status_code=500, detail="伺服器內部錯誤") from e
    finally:
        cur.close()

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
        # Check if driver_id exists
        cur.execute("SELECT id FROM drivers WHERE id = %s", (driver_time.driver_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="司機不存在")

        # Insert the time slot
        cur.execute(
            """
            INSERT INTO driver_time (driver_id, date, start_time, locations)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
            """,
            (driver_time.driver_id, driver_time.date, driver_time.start_time, driver_time.locations)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"id": new_id, "status": "success"}
    except HTTPException as he:
        conn.rollback()
        raise he
    except Exception as e:
        conn.rollback()
        logging.error("Error adding driver time: %s", str(e))
        raise HTTPException(status_code=500, detail="伺服器內部錯誤") from e
    finally:
        cur.close()

@router.get("/all/times", response_model=List[DriverTimeDetail])
async def get_all_drivers_times(conn: Connection = Depends(get_db)):
    """
    Retrieve available time slots for all driver.

    Args:
        conn (Connection): The database connection.

    Returns:
        list: A list of dictionaries representing the available time slots for all drivers. Each dictionary contains
              the time slot ID, date, start time, location, driver's name, and phone number.
    """
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT dt.id, dt.date, dt.start_time, dt.locations, d.driver_name, d.driver_phone
            FROM driver_time dt
            JOIN drivers d ON dt.driver_id = d.id
            """
        )
        times = cur.fetchall()
        logging.info('start create driver time list')
        time_list:List[DriverTimeDetail] = []
        for time in times:
            time_list.append({
                "id": time[0],
                "date": str(time[1]),
                "start_time": str(time[2]),
                "locations": time[3],
                "driver_name": time[4],
                "driver_phone": time[5]
            })
        return time_list
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error("Error fetching driver times: %s", str(e))
        raise HTTPException(status_code=500, detail="伺服器內部錯誤") from e
    finally:
        cur.close()




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
        # Check if driver_id exists
        cur.execute("SELECT id FROM drivers WHERE id = %s", (driver_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="司機不存在")

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
                "start_time": time[2].isoformat(),
                "locations": time[3],
                "driver_name": time[4],
                "driver_phone": time[5]
            }
            for time in times
        ]
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error("Error fetching driver times: %s", str(e))
        raise HTTPException(status_code=500, detail="伺服器內部錯誤") from e
    finally:
        cur.close()

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
        # Check if the time slot exists
        cur.execute("SELECT id FROM driver_time WHERE id = %s", (id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="時間段不存在")

        cur.execute(
            """
            DELETE FROM driver_time
            WHERE id = %s
            """,
            (id,)
        )
        conn.commit()
        return {"status": "success", "message": f"Deleted time slot with ID {id}"}
    except HTTPException as he:
        conn.rollback()
        raise he
    except Exception as e:
        conn.rollback()
        logging.error("Error deleting driver time: %s", str(e))
        raise HTTPException(status_code=500, detail="伺服器內部錯誤") from e
    finally:
        cur.close()

@router.delete("/drop_agricultural_order/{driver_id}/{order_id}")
async def delete_received_agricultural_product(driver_id: int, order_id: int, conn: Connection = Depends(get_db)):
    """
    Delete received_agricultural_product order.

    Args:
        driver_id (int): The ID of the driver
        order_id (int): The id of agricultural order
        conn (Connection): The database connection.

    Returns:
        dict: A dictionary containing the success status and a message indicating the deleted driver order id.
    """
    cur = conn.cursor()
    try:
        # Check if the driver exists
        cur.execute("SELECT id FROM drivers WHERE id = %s", (driver_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="司機不存在")
        # Check if the agricultural order exists
        cur.execute("SELECT id FROM agricultural_product_order WHERE id = %s", (order_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="農產品訂單不存在")
        logging.info("Start delete driver order")
        cur.execute(
            """
            DELETE FROM driver_orders
            WHERE driver_id = %s and order_id = %s and service = %s
            """,
            (driver_id, order_id, 'agricultural_product',)
        )

        logging.info("Start change status")
        #change agricultural product status from 接單 to 未接單
        cur.execute(
            """
            UPDATE agricultural_product_order
            SET status = %s
            WHERE id = %s
            """,
            ('未接單', order_id)
        )
        conn.commit()
        return {"status": "success", "message": f"Deleted driver agricultural order"}
    except HTTPException as he:
        conn.rollback()
        raise he
    except Exception as e:
        conn.rollback()
        logging.error("Error drop agricultural driver order: %s", str(e))
        raise HTTPException(status_code=500, detail="伺服器內部錯誤") from e
    finally:
        cur.close()
