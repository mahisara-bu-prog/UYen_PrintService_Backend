from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import *
from schemas import *

# ⚠️ import from main (your current choice)
from database import get_db

from tokens import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    require_role
)

router = APIRouter(
    tags=["Staff"]
)

# =========================
# 🔹 Login (Staff)
# =========================
@router.post("/staff_login/")
def login_staff(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(Staff).filter(Staff.user_name == data.user_name).first()

    if not user or user.password_hashed != data.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if user.user_role not in ["Staff", "Admin", "Owner"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not user.user_status:
        raise HTTPException(status_code=403, detail="User inactive")

    access_token = create_access_token({
        "sub": user.user_name,
        "role": user.user_role
    })

    refresh_token = create_refresh_token({
        "sub": user.user_name
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "username": user.user_name,
        "role": user.user_role
    }


# =========================
# 🔹 Refresh Token
# =========================
@router.post("/refresh_token/")
def refresh_token(token: str):

    payload = decode_token(token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access_token = create_access_token({
        "sub": payload.get("sub")
    })

    return {"access_token": new_access_token}


# =========================
# 🔹 Get All Staff
# =========================
@router.get("/staff_fetch/", response_model=list[StaffResponse])
def get_all_staff(
    db: Session = Depends(get_db),
    user=Depends(require_role(["Admin", "Owner"]))
):
    return db.query(Staff).all()


# =========================
# 🔹 Get One Staff
# =========================
@router.get("/staff/{user_id}", response_model=StaffResponse)
def get_staff(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    staff = db.query(Staff).filter(Staff.user_id == user_id).first()

    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    return staff


# =========================
# 🔹 Update Staff
# =========================
@router.put("/staff/{user_id}", response_model=StaffResponse)
def update_staff(
    user_id: int,
    updated_data: StaffUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Admin", "Owner"]))
):

    staff = db.query(Staff).filter(Staff.user_id == user_id).first()

    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    if updated_data.name is not None:
        staff.name = updated_data.name

    if updated_data.email is not None:
        staff.email = updated_data.email

    if updated_data.phone is not None:
        staff.phone = updated_data.phone

    if updated_data.password is not None:
        staff.password_hashed = updated_data.password

    if updated_data.user_role is not None:
        staff.user_role = updated_data.user_role.value

    if updated_data.user_status is not None:
        staff.user_status = updated_data.user_status

    db.commit()
    db.refresh(staff)

    return staff


# =========================
# 🔹 Delete Staff
# =========================
@router.delete("/staff/{user_id}")
def delete_staff(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Admin","Owner"]))
):

    staff = db.query(Staff).filter(Staff.user_id == user_id).first()

    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    db.delete(staff)
    db.commit()

    return {"message": "Staff deleted successfully"}