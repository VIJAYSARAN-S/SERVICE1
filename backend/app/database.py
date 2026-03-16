from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Diagnostic logging for Render (masks password)
def scrub_password(url):
    import re
    if not url: return "None or Empty"
    return re.sub(r':([^@/]+)@', ':****@', url)

if not DATABASE_URL:
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'egov_v2.db')}"
    print(f"DEBUG: Using fallback SQLite database: {scrub_password(DATABASE_URL)}")
else:
    # Clean possible accidental quotes or whitespace from Render env vars
    DATABASE_URL = DATABASE_URL.strip().strip('"').strip("'")
    print(f"DEBUG: Using environment DATABASE_URL: {scrub_password(DATABASE_URL)}")

# Fix Heroku/Neon style 'postgres://' which SQLAlchemy doesn't like
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Use connect_args only for SQLite, pool_pre_ping for Postgres
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # Use pool_pre_ping=True for cloud databases like Neon Postgres
    # Add pool_size and max_overflow for better concurrent handling in production
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()