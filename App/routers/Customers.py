from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta

from models import *
from schemas import *

# ⚠️ still using your current structure
from database import get_db
from tokens import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    require_role
)

router = APIRouter(
    tags=["Customer"]
)

# =========================
# 🔹 Create Walk-In Sessions
# =========================
@router.post("/walkin/session")
def create_walkin_session(db: Session = Depends(get_db)):

    token = str(uuid.uuid4())

    new_session = WalkinSession(
        session_token=token,
        expires_at=datetime.utcnow() + timedelta(hours=2)
    )

    db.add(new_session)
    db.commit()

    return {"session_token": token}


# =========================
# 🔹 Register Customer
# =========================
@router.post("/customer_reg", response_model=CustomerResponse)
def create_customer(cust: CustomerCreate, db: Session = Depends(get_db)):

    if db.query(Customer).filter(Customer.Email == cust.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(Customer).filter(Customer.username == cust.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    new_customer = Customer(
        NAME=cust.name,
        Email=cust.email,
        Phone_No=cust.phone_no,
        username=cust.username,
        password_hash=cust.password,  # ⚠️ plain text (temporary)
        suspended_status=True
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


# =============================
# 🔹 Get All Customer
# =============================
@router.get("/customer_fetch/", response_model=list[CustomerResponse])
def get_all_customer(
    db: Session = Depends(get_db),
    user=Depends(require_role(["Admin", "Staff"]))
):
    return db.query(Customer).all()


# =============================
# 🔹 Get One Customer
# =============================
@router.get("/customer/{user_id}", response_model=CustomerResponse)
def get_customer(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.Customer_ID == user_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer

# =============================
# 🔹 Update Customer (Staff/Admin Auth.)
# =============================
@router.put("/customer/{customer_id}", response_model=CustomerResponse)  #! This function not update data on DB yet
def update_customer(
    customer_id: int,
    updated_data: CustomerUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    customer = db.query(Customer).filter(Customer.Customer_ID == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if updated_data.NAME is not None:
        customer.name = updated_data.NAME

    if updated_data.Email is not None:
        # check duplicate email
        existing = db.query(Customer).filter(Customer.Email == updated_data.Email).first()
        if existing and existing.Customer_ID != customer.Customer_ID:
            raise HTTPException(status_code=400, detail="Email already registered")
        customer.Email = updated_data.Email

    if updated_data.Phone_no is not None:
        customer.Phone_No = updated_data.phone_no

    if updated_data.username is not None: #! CustomerUpdate Has no attribute "username"
        existing = db.query(Customer).filter(Customer.username == updated_data.username).first()
        if existing and existing.Customer_ID != customer.Customer_ID:
            raise HTTPException(status_code=400, detail="Username already taken")
        customer.username = updated_data.username

    if updated_data.password_hash is not None:
        customer.password_hash = updated_data.password_hash  # ⚠️ still plain text

    if updated_data.suspended_status is not None:
        customer.suspended_status = updated_data.suspended_status

    db.commit()
    db.refresh(customer)
    print(updated_data.dict())
    return customer
    # return {"message": "Customer UPDATE successfully"}



# =============================
# 🔹 Delete Customer (Staff/Admin Auth.)
# =============================
@router.delete("/customer/{customer_id}") #! This Function Can't find any Customer Users and delete Yet
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Admin", "Owner"]))  # 🔥 restrict delete
):
    customer = db.query(Customer).filter(Customer.Customer_ID == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()

    return {"message": "Customer deleted successfully"}

# =========================
# 🔹 Login (Customer)
# =========================
@router.post("/customer_login/") #! This function always tell Invalid Username and Password
def login_customer(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(Customer).filter(Customer.username == data.user_name).first()

    if not user or user.password_hash != data.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not user.suspended_status:
        raise HTTPException(status_code=403, detail="User inactive")

    access_token = create_access_token({
        "sub": user.username,
        "suspend": user.suspended_status
    })

    refresh_token = create_refresh_token({
        "sub": user.username
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "username": user.username,
        "Not_Suspended": user.suspended_status
    }