from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import User
import os
import csv
import re
from pydantic import BaseModel, EmailStr, validator

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "interview-demo-key-change-in-production-32chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours for demo

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CSV file for storing credentials (demo purposes)
CREDENTIALS_CSV = "credentials.csv"


# Pydantic models with validation
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

    @validator('full_name')
    def sanitize_name(cls, v):
        # Strip HTML tags and limit length
        v = re.sub(r'<[^>]*>', '', v)
        if len(v) > 100:
            raise ValueError('Name too long')
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str, db: Session):
    """Get current user from JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = db.query(User).filter(User.email == email).first()
        return user
    except JWTError:
        return None


def save_credentials_to_csv(email: str, password_hash: str, full_name: str):
    """Save credentials to CSV file for demo purposes"""
    file_exists = os.path.isfile(CREDENTIALS_CSV)

    with open(CREDENTIALS_CSV, 'a', newline='') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['email', 'password_hash', 'full_name', 'created_at'])
        writer.writerow([email, password_hash, full_name, datetime.utcnow().isoformat()])


def load_credentials_from_csv():
    """Load credentials from CSV file"""
    credentials = []
    if os.path.isfile(CREDENTIALS_CSV):
        with open(CREDENTIALS_CSV, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                credentials.append(row)
    return credentials
