import uuid, os, shutil
from datetime import datetime, timedelta, UTC, date

from fastapi import FastAPI, Depends, HTTPException, Security, UploadFile, File, APIRouter, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, Session
from routers import StaffMan, Customers,StockManage ,OrderMan ,report
from models import *
from schemas import *
from database import get_db
from tokens import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    require_role,
    get_optional_user
)

# =========================
# 🔹 Config
# =========================
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATABASE_URL = "mysql+pymysql://root:root@mysql:3306/my_db"

# =========================
# 🔹 Database Setup
# =========================
engine = create_engine(DATABASE_URL)
Session_Local = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

# =========================
# 🔹 App Init
# =========================
app = FastAPI()

# 👉 Router defined separately (correct usage)
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 🔹 Dependency
# =========================
# def get_db():
#     db = Session_Local()
#     try:
#         yield db
#     finally:
#         db.close()

# =========================
# 🔹 Business Logic
# =========================
# def get_status(material):
#     if material.quantity == 0:
#         return "Out of Stock"
#     elif material.quantity <= material.threshold:
#         return "Nearly Out"
#     else:
#         return "Available"

# =========================
# 🔹 Attach Router to App
# =========================
app.include_router(router)
app.include_router(StaffMan.router)
app.include_router(Customers.router)
app.include_router(StockManage.router)
app.include_router(OrderMan.router)
app.include_router(report.router)
@app.get("/")
def root():
    return {"message": "API is running"}