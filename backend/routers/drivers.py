from fastapi import APIRouter, HTTPException
import psycopg2
from ..models.driver import Driver
from ..database import get_db_connection

router = APIRouter()

@router.post("/")
async def create_driver(driver: Driver):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT phone FROM drivers WHERE phone = %s", (driver.phone,))
        existing_driver = cur.fetchone()
        if existing_driver:
            raise HTTPException(status_code=409, detail="電話號碼已存在")

        cur.execute(
            "INSERT INTO drivers (name, phone, direction, available_date, start_time, end_time) VALUES (%s, %s, %s, %s, %s, %s)",
            (driver.name, driver.phone, driver.direction, driver.available_date, driver.start_time, driver.end_time)
        )
        
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        print(f"Error: {str(e)}") 
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/{phone}")
async def get_driver(phone: str):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT * FROM drivers WHERE phone = %s", (phone,))
        driver = cur.fetchone()
        if not driver:
            raise HTTPException(status_code=404, detail="電話號碼未註冊")
        
        return {
            "id": driver[0],
            "name": driver[1],
            "phone": driver[2],
            "direction": driver[3],
            "available_date": driver[4],
            "start_time": driver[5],
            "end_time": driver[6],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.patch("/{phone}")
async def update_driver(phone: str, driver: Driver):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "UPDATE drivers SET name = %s, direction = %s, available_date = %s, start_time = %s, end_time = %s WHERE phone = %s",
            (driver.name, driver.direction, driver.available_date, driver.start_time, driver.end_time, phone)
        )

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/{driver_id}/orders")
async def get_driver_orders(driver_id: int):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT orders.* 
            FROM orders 
            JOIN driver_orders ON orders.id = driver_orders.order_id 
            WHERE driver_orders.driver_id = %s AND driver_orders.action = '接單'
        """, (driver_id,))
        orders = cur.fetchall()
        order_list = []
        for order in orders:
            cur.execute("SELECT * FROM order_items WHERE order_id = %s", (order[0],))
            items = cur.fetchall()
            order_list.append({
                "id": order[0],
                "name": order[1],
                "phone": order[2],
                "date": order[3],
                "time": order[4],
                "location": order[5],
                "is_urgent": order[6],
                "total_price": order[7],
                "order_type": order[8],
                "order_status": order[9],
                "items": [{"id": item[2], "name": item[3], "price": item[4], "quantity": item[5], "img": item[6]} for item in items],
                "note": order[10]
            })
        
        return order_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
