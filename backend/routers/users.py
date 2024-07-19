"""
User management API using FastAPI and PostgreSQL.

This module provides endpoints to create and retrieve user information.
It uses FastAPI for defining the API routes and psycopg2 for database interactions.

Endpoints:
- POST /users: Create a new user.
- GET /users/{user_id}: Retrieve a user by ID.

"""

from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extensions import connection as Connection
from backend.models.models import User
from backend.database import get_db_connection

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



@router.post("/users", response_model=User)
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
        cur.execute("SELECT id FROM users WHERE phone = %s", (user.phone,))
        existing_user = cur.fetchone()
        if existing_user:
            raise HTTPException(status_code=409, detail="User with this phone already exists")

        cur.execute(
            "INSERT INTO users (name, phone) VALUES (%s, %s) RETURNING id",
            (user.name, user.phone)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        return {**user.dict(), "id": user_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        cur.close()

@router.get("/users/{user_id}", response_model=User)
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
