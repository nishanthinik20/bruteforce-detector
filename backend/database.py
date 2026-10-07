import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bruteforce.db")

# SQLite ku special connect_args
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency - DB session kudukkum"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Tables create pannum"""
    from models import Device, LoginAttempt, BlockedIP, Alert  # noqa
    Base.metadata.create_all(bind=engine)