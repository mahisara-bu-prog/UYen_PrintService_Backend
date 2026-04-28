# #!
# #! All Function are Error At the Database Operation <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
# from fastapi import APIRouter, Depends, UploadFile, File, Form
# from fastapi.responses import FileResponse
# from sqlalchemy.orm import Session
# import uuid, os, shutil

# from models import *
# from schemas import *

# # ⚠️ your current structure
# #from main_3 import UPLOAD_DIR
# from database import get_db
# from tokens import require_role
# # =========================
# # 🔹 Config
# # =========================
# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# router = APIRouter(
#     tags=["Order"]
# )

# # =========================
# # 🔹 CREATE ORDER
# # =========================
# @router.post("/create_order") #! Brokennn
# async def create_order(
#     user_id: int = Form(...),
#     paper_size: str = Form(...),
#     paper_type: str = Form(...),
#     copy_amount: int = Form(...),
#     price_per_unit: float = Form(...),
#     pickup_date: str = Form(None),
#     note: str = Form(None),
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db)
# ):
#     # ✅ Create unique filename
#     unique_name = f"{uuid.uuid4()}_{file.filename}"
#     file_path = os.path.join(UPLOAD_DIR, unique_name)

#     # ✅ Save file
#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     # ✅ Calculate total price
#     total_price = copy_amount * price_per_unit

#     # ✅ Create DB record
#     order = Order(
#         user_id=user_id,
#         file_path=file_path,
#         file_name=file.filename,
#         paper_size=paper_size,
#         paper_type=paper_type,
#         copy_amount=copy_amount,
#         price_per_unit=price_per_unit,
#         total_price=total_price,
#         pickup_date=pickup_date,
#         note=note
#     )

#     db.add(order)
#     db.commit()
#     db.refresh(order)

#     return {
#         "message": "Order created successfully",
#         "order_id": order.order_id
#     }


# # =========================
# # 🔹 GET ALL ORDERS (Staff Side)
# # =========================
# @router.get("/orders")
# def get_orders(
#     db: Session = Depends(get_db),
#     user=Depends(require_role(["Staff", "Admin", "Owner"]))  # ✅ added auth
# ):
#     return db.query(Order).all()


# # =========================
# # 🔹 UPDATE STATUS
# # =========================
# @router.put("/order/{order_id}/status")
# def update_status(
#     order_id: int,
#     status: str,
#     db: Session = Depends(get_db),
#     user=Depends(require_role(["Staff", "Admin", "Owner"]))  # ✅ added auth
# ):
#     order = db.query(Order).filter(Order.order_id == order_id).first()

#     if not order:
#         return {"error": "Order not found"}

#     order.status = status
#     db.commit()

#     return {"message": "Status updated"}


# # =========================
# # 🔹 DOWNLOAD FILE
# # =========================
# @router.get("/download/{order_id}")
# def download_file(
#     order_id: int,
#     db: Session = Depends(get_db),
#     user=Depends(require_role(["Staff", "Admin", "Owner"]))  # ✅ protected
# ):
#     order = db.query(Order).filter(Order.order_id == order_id).first()

#     if not order:
#         return {"error": "Not found"}

#     return FileResponse(path=order.file_path, filename=order.file_name)


# # =========================
# # 🔥 NEW: PRINTING QUEUE
# # =========================
# @router.get("/orders/queue/printing")
# def get_printing_queue(
#     db: Session = Depends(get_db),
#     user=Depends(require_role(["Staff", "Admin", "Owner"]))
# ):
#     orders = (
#         db.query(Order)
#         .filter(Order.status == "Printing")
#         .order_by(Order.create_date.asc())   # ✅ sort by oldest first
#         .all()
#     )

#     return orders



# =========================
# 📦 IMPORTS
# =========================
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime ,timezone 
import uuid, os, shutil

# 🔹 Your project modules
from database import get_db
from models import Order, PaperSize, PaperType
from tokens import require_role

# =========================
# 🔹 CONFIG
# =========================
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

# =========================
# 🔹 CREATE ORDER
# =========================
@router.post("/create")
async def create_order(
    user_id: int = Form(...),
    paper_size_id: int = Form(...),
    paper_type_id: int = Form(...),
    copy_amount: int = Form(...),
    price_per_unit: float = Form(...),
    pickup_date: str = Form(None),
    note: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # ✅ Validate FK
        if not db.query(PaperSize).filter_by(paper_size_id=paper_size_id).first():
            raise HTTPException(status_code=400, detail="Invalid paper_size_id")

        if not db.query(PaperType).filter_by(paper_type_id=paper_type_id).first():
            raise HTTPException(status_code=400, detail="Invalid paper_type_id")

        # ✅ Parse pickup date
        pickup_dt = None
        if pickup_date:
            try:
                pickup_dt = datetime.fromisoformat(pickup_date)
            except:
                raise HTTPException(status_code=400, detail="Invalid pickup_date format")

        # ✅ File validation
        if file.content_type not in ["application/pdf", "image/png", "image/jpeg"]:
            raise HTTPException(status_code=400, detail="Invalid file type")

        # ✅ Save file
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ✅ Calculate total
        total_price = copy_amount * price_per_unit

        # ✅ Create order
        order = Order(
            user_id=user_id,
            file_path=file_path,
            file_name=file.filename,
            paper_size_id=paper_size_id,
            paper_type_id=paper_type_id,
            copy_amount=copy_amount,
            price_per_unit=price_per_unit,
            total_price=total_price,
            status="Pending",
            order_received_date=datetime.now(timezone.utc),
            pickup_date=pickup_dt,
            note=note
        )

        db.add(order)
        db.commit()
        db.refresh(order)

        return {
            "message": "Order created successfully",
            "order_id": order.order_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# 🔹 GET ALL ORDERS (JOINED)
# =========================
@router.get("/")
def get_orders(
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    results = (
        db.query(
            Order,
            PaperSize.name.label("paper_size"),
            PaperType.name.label("paper_type")
        )
        .join(PaperSize, Order.paper_size_id == PaperSize.paper_size_id)
        .join(PaperType, Order.paper_type_id == PaperType.paper_type_id)
        .all()
    )

    return [
        {
            "order_id": r.Order.order_id,
            "user_id": r.Order.user_id,
            "paper_size": r.paper_size,
            "paper_type": r.paper_type,
            "copies": r.Order.copy_amount,
            "price_per_unit": float(r.Order.price_per_unit),
            "total_price": float(r.Order.total_price),
            "status": r.Order.status,
            "created_date": r.Order.created_date
        }
        for r in results
    ]


# =========================
# 🔹 UPDATE STATUS
# =========================
@router.put("/{order_id}/status")
def update_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    order = db.query(Order).filter(Order.order_id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()

    return {"message": "Status updated"}


# =========================
# 🔹 DOWNLOAD FILE
# =========================
@router.get("/download/{order_id}")
def download_file(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    order = db.query(Order).filter(Order.order_id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not os.path.exists(order.file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=order.file_path,
        filename=order.file_name
    )


# =========================
# 🔹 PRINTING QUEUE
# =========================
@router.get("/queue/printing")
def get_printing_queue(
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    orders = (
        db.query(Order)
        .filter(or_(
            Order.status == "Pending",
            Order.status == "Printing"
        ))
        .order_by(Order.created_date.asc())
        .all()
    )

    return orders

# =========================
# 🔹 Complete Order
# =========================
@router.get("/queue/complete")
def get_printing_queue(
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    orders = (
        db.query(Order)
        .filter(or_(
            Order.status == "Completed",
            Order.status == "Cancelled"
        ))
        .order_by(Order.created_date.asc())
        .all()
    )

    return orders

# =========================
# 🔹 Complete Order
# =========================
@router.get("/queue/printing")
def get_printing_queue(
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    orders = (
        db.query(Order)
        .filter(Order.status == "Cancelled" or Order.status == "Completed")
        .order_by(Order.created_date.asc())
        .all()
    )

    return orders



# =========================
# 🔹 GET PAPER OPTIONS (FOR FRONTEND)
# =========================
@router.get("/meta/paper-sizes")
def get_paper_sizes(db: Session = Depends(get_db)):
    return db.query(PaperSize).all()


@router.get("/meta/paper-types")
def get_paper_types(db: Session = Depends(get_db)):
    return db.query(PaperType).all()