from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from backend.models.models import User
from backend.database import get_db_connection
import logging

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

@router.post("/login")
async def login(phone: str, conn: Connection = Depends(get_db)):
    """
    Login user by phone number.

    Args:
        phone (str): The phone number to login.
        conn (Connection): The database connection.

    Returns:
        dict: The user data if phone number exists.
    """
    cur = conn.cursor()
    try:
        logging.info("Logging in user with phone number %s", phone)
        cur.execute("SELECT id, name, phone FROM users WHERE phone = %s", (phone,))
        user = cur.fetchone()
        if not user:
            logging.warning("User with phone number %s not found", phone)
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": user[0], "name": user[1], "phone": user[2]}
    except Exception as e:
        logging.error("Error occurred during login: %s", str(e))
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
            "INSERT INTO users (name, phone) VALUES (%s, %s) RETURNING id",
            (user.name, user.phone)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        logging.info("User created with ID %s", user_id)
        return {**user.dict(), "id": user_id}
    except Exception as e:
        conn.rollback()
        logging.error("Error occurred: %s", str(e))
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
        cur.execute("SELECT id, name, phone FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": user[0], "name": user[1], "phone": user[2]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()
