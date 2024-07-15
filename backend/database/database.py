import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/shopping")

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn
