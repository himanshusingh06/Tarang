from pydantic import BaseModel, EmailStr


class StaffCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserUpdateAdmin(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    role: str | None = None
    is_active: bool | None = None
