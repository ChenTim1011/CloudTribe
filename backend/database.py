import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


# Fetch the DATABASE_URL from environment variables
database_url = os.environ.get('DATABASE_URL')

def get_db_connection():
    conn = psycopg2.connect(database_url)
    return conn
