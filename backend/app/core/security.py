from datetime import datetime, timedelta
from typing import Any
import hashlib

import bcrypt
from argon2 import PasswordHasher, exceptions as argon2_exceptions
from jose import jwt

from app.core.config import settings

ALGORITHM = "HS256"

# Argon2 is the default for new passwords. Bcrypt is supported only to
# verify legacy hashes created before this change.
_password_hasher = PasswordHasher()
_BCRYPT_PREFIXES = ("$2a$", "$2b$", "$2y$")


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta
    to_encode: dict[str, Any] = {
        "exp": expire,
        "sub": str(subject),
    }

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    if hashed_password.startswith(_BCRYPT_PREFIXES):
        # Legacy bcrypt hashes were created from a SHA256 pre-hash.
        hashed_input = hashlib.sha256(plain_password.encode()).hexdigest().encode()
        try:
            return bcrypt.checkpw(hashed_input, hashed_password.encode())
        except ValueError:
            return False
    try:
        return _password_hasher.verify(hashed_password, plain_password)
    except argon2_exceptions.VerifyMismatchError:
        return False
    except argon2_exceptions.VerificationError:
        return False


def get_password_hash(password: str) -> str:
    return _password_hasher.hash(password)


def needs_rehash(hashed_password: str) -> bool:
    if not hashed_password:
        return False
    if hashed_password.startswith(_BCRYPT_PREFIXES):
        return True
    try:
        return _password_hasher.check_needs_rehash(hashed_password)
    except argon2_exceptions.VerificationError:
        return True
