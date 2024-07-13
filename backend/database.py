from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

engine = create_engine("postgresql://postgres:password@localhost:5432/shopping")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

"""
This module provides the necessary tools for connecting to and interacting with the database.

The module includes the following components:
- `engine`: The SQLAlchemy engine object that represents the database connection.
- `SessionLocal`: A sessionmaker object that creates individual sessions for database operations.
- `Base`: The declarative base class for defining database models.

"""
