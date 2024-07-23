import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():
    conn = psycopg2.connect('DATABASE_URL')
    return conn
