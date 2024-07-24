import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

#DATABASE_URL =  "postgresql://postgres:password@localhost:5432/shopping"
DATABASE_URL =  "postgresql://postgres:jasmine0108@localhost:5432/postgres"


def get_db_connection():
    conn = psycopg2.connect( DATABASE_URL )
    return conn
