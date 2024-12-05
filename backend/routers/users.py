"""
User management API using FastAPI and PostgreSQL.

This module provides endpoints to create and retrieve user information.
It uses FastAPI for defining the API routes and psycopg2 for database interactions.

Endpoints:
- POST /users: Create a new user.
- POST /users/login: Login user by phone number.
- GET /users/{user_id}: Retrieve a user by ID.

"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from psycopg2.extensions import connection as Connection
from backend.models.user import User, UpdateLocationRequest
from backend.database import get_db_connection
import logging
import json
from datetime import datetime


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('/var/log/logistics/user.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def log_event(event_type: str, data: dict):
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "data": data
    }
    logger.info(json.dumps(log_data))

class LoginRequest(BaseModel):
    phone: str

router = APIRouter()

def get_db():
    """
    Get a database connection.
    
    Yields:
        psycopg2.extensions.connection: A PostgreSQL database connection.
    """
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

@router.post("/login", response_model=User)
async def login(request: LoginRequest, conn: Connection = Depends(get_db)):
    """
    Login user by phone number.

    Args:
        request (LoginRequest): The phone number to login.
        conn (Connection): The database connection.

    Returns:
        dict: The user data if phone number exists.
    """
    log_event("USER_LOGIN_ATTEMPT", {
        "phone": request.phone
    })

    cur = conn.cursor()
    try:
        phone = request.phone
        logging.info("Logging in user with phone number %s", phone)
        cur.execute("SELECT id, name, phone, location, is_driver FROM users WHERE phone = %s", (phone,))
        user = cur.fetchone()
        if not user:
            logging.warning("User with phone number %s not found", phone)
            raise HTTPException(status_code=404, detail="User not found")
        
        log_event("USER_LOGIN_SUCCESS", {
            "user_id": user[0],
            "phone": user[2],
            "is_driver": user[4]
        })
        return {"id": user[0], "name": user[1], "phone": user[2], "location":user[3], "is_driver": user[4]}
    except Exception as e:
        log_event("USER_LOGIN_ERROR", {
            "phone": request.phone,
            "error": str(e)
        })
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.post("/", response_model=User)
async def create_user(user: User, conn: Connection = Depends(get_db)):
    """
    Create a new user.

    Args:
        user (User): The user data to be created.
        conn (Connection): The database connection.

    Returns:
        dict: The created user data.
    """
    cur = conn.cursor()
    try:
        logging.info("Checking if user with phone number %s already exists", user.phone)
        cur.execute("SELECT id FROM users WHERE phone = %s", (user.phone,))
        existing_user = cur.fetchone()
        if existing_user:
            logging.warning("User with phone number %s already exists", user.phone)
            # phonenumber already exists
            raise HTTPException(status_code=409, detail=f"電話號碼 {user.phone} 已存在，請更換電話號碼")
        
        logging.info("Inserting new user with name %s and phone %s", user.name, user.phone)
        cur.execute(
            "INSERT INTO users (name, phone, location,is_driver) VALUES (%s, %s, %s, %s) RETURNING id",
            (user.name, user.phone, '未選擇', False)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        log_event("USER_REGISTRATION_STARTED", {
            "name": user.name,
            "phone": user.phone
        })
        logging.info("User created with ID %s", user_id)
        log_event("USER_REGISTERED", {
            "user_id": user_id,
            "name": user.name,
            "phone": user.phone,
            "status": "success"
        })
        return {**user.dict(), "id": user_id}
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
        log_event("USER_REGISTRATION_ERROR", {
            "name": user.name,
            "phone": user.phone,
            "error": str(e)
        })
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int, conn: Connection = Depends(get_db)):
    """
    Get a user by ID.

    Args:
        user_id (int): The ID of the user to retrieve.
        conn (Connection): The database connection.

    Returns:
        dict: The user data.
    """
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, name, phone, location , is_driver FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": user[0], "name": user[1], "phone": user[2], "location":user[3], "is_driver": user[4]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.patch("/location/{userId}")
async def update_nearest_location(userId: str, req: UpdateLocationRequest, conn: Connection = Depends(get_db)):
    """
    Update user information by userId.

    Args:
        userId (str): The user's id.
        req (UpdateLocationRequest): The updated user nearest location.
        conn (Connection): The database connection.

    Returns:
        dict: A success message.
    """
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE users SET location = %s WHERE id = %s",
            ( req.location, userId )
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        logging.error("Error updating user nearest location: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.patch("/driver/{user_id}", response_model=dict)
async def update_is_driver(user_id: int, conn: Connection = Depends(get_db)):
    """
    Update the user's is_driver status to True
    """
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE users SET is_driver = TRUE WHERE id = %s", (user_id,)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating user to driver: {str(e)}") from e
    finally:
        cur.close()
