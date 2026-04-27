from pydantic import BaseModel, EmailStr
from enum import Enum
from typing  import Optional,List


class LoginRequest(BaseModel):
    user_name: str
    password: str


# ✅ Match DB EXACTLY (case-sensitive)
class RoleEnum(str, Enum):
    Staff = "Staff"
    Owner = "Owner"
    Admin = "Admin"


# =========================
# 🔹 Base Schema (Staff)
# =========================
class StaffBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    user_name: str


# =========================
# 🔹 Create (Request)
# =========================
class StaffCreate(StaffBase):
    password: str
    user_role: RoleEnum


# =========================
# 🔹 Response
# =========================
class StaffResponse(StaffBase):
    user_id: int
    user_role: RoleEnum
    user_status: bool

    class Config:
        from_attributes = True


# =========================
# 🔹 Login (Optional)
# =========================
class StaffLogin(BaseModel):
    user_name: str
    password: str


# =========================
# 🔹 Update (Optional)
# =========================
class StaffUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    password: str | None = None
    user_role: RoleEnum | None = None
    user_status: bool | None = None


# =========================
# 🔹 Base Schemas (Customer)
# =========================
class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone_no: str
    username: str



# =========================
# 🔹 Create (Request)
# =========================
class CustomerCreate(CustomerBase):
    password: str   # plain password (will be hashed in backend)

class CustomerLogin(BaseModel):
    username: str
    password: str

class CustomerUpdate(BaseModel):
    username: Optional[str] = None
    NAME: Optional[str] = None
    Email: Optional[str] = None
    Phone_no: Optional[str] = None
    password_hash: Optional[str] = None
    suspended_status: Optional[bool] = None

    class Config:
        orm_mode = True


# =========================
# Response (Customer)
# =========================
class CustomerResponse(BaseModel):
    Customer_ID: int
    NAME : str | None = None
    Email : str | None = None
    Phone_No :str | None = None
    username : str | None = None
    password_hash : str |None = None
    suspended_status : bool | None = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    file_url: str
    session_token: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    file_url: str
    status: str

    class Config:
        from_attributes = True

class Property(BaseModel):
    property_name: str
    property_value: str

class MaterialCreate(BaseModel):
    material_name: str
    category: str
    unit: str
    price_per_unit: float
    quantity: int
    threshold: int
    properties: Optional[List[Property]] = []

class MaterialUpdate(BaseModel):
    material_name: Optional[str]
    category: Optional[str]
    unit: Optional[str]
    price_per_unit: Optional[float]
    threshold: Optional[int]

class StockAction(BaseModel):
    amount: int

# =========================
# 🔹 Material Property Response
# =========================
class MaterialPropertyResponse(BaseModel):
    property_name: str
    property_value: str

    class Config:
        from_attributes = True

class MaterialResponse(BaseModel):
    material_id: int
    material_name: str
    category: str
    unit: str
    price_per_unit: float
    quantity: int
    threshold: int
    status: str
    properties: List[MaterialPropertyResponse]

    class Config:
        from_attributes = True

class StockAction(BaseModel):
    amount: int
    note: Optional[str] = None
    username: str

