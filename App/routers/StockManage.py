from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import *
from schemas import *

# ⚠️ still using your current structure
# from main_3 import  get_status
from database import get_db
from tokens import require_role

router = APIRouter(
    tags=["Stock"]
)
def get_status(material):
    if material.quantity == 0:
        return "Out of Stock"
    elif material.quantity <= material.threshold:
        return "Nearly Out"
    else:
        return "Available"
# =========================
# 🔹 CREATE MATERIAL
# =========================
@router.post("/create_materials")
def create_material(
    data: MaterialCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))  # ✅ added auth
):
    material = Material(
        material_name=data.material_name,
        category=data.category,
        unit=data.unit,
        price_per_unit=data.price_per_unit,
        quantity=data.quantity,
        threshold=data.threshold
    )

    db.add(material)
    db.commit()
    db.refresh(material)

    for prop in data.properties:
        db.add(MaterialProperty(
            material_id=material.material_id,
            property_name=prop.property_name,
            property_value=prop.property_value
        ))

    db.commit()

    return {"message": "Material created", "material_id": material.material_id}


# =========================
# 🔹 UPDATE MATERIAL
# =========================
@router.put("/materials/{material_id}")
def update_material(
    material_id: int,
    data: MaterialUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))  # ✅ added auth
):
    material = db.query(Material).get(material_id)

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(material, key, value)

    db.commit()

    return {"message": "Material updated"}
# =========================
# 🔹 GET ALL MATERIALS
# =========================
@router.get("/materials", response_model=list[MaterialResponse])
def get_all_materials(
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    materials = db.query(Material).all()

    result = []
    for m in materials:
        props = db.query(MaterialProperty).filter(
            MaterialProperty.material_id == m.material_id
        ).all()

        result.append({
            "material_id": m.material_id,
            "material_name": m.material_name,
            "category": m.category,
            "unit": m.unit,
            "price_per_unit": m.price_per_unit,
            "quantity": m.quantity,
            "threshold": m.threshold,
            "status": get_status(m),  # ✅ your logic reused
            "properties": props
        })

    return result

# =========================
# 🔹 GET ONE MATERIAL
# =========================
@router.get("/materials/{material_id}", response_model=MaterialResponse)
def get_material(
    material_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    material = db.query(Material).get(material_id)

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    props = db.query(MaterialProperty).filter(
        MaterialProperty.material_id == material.material_id
    ).all()

    return {
        "material_id": material.material_id,
        "material_name": material.material_name,
        "category": material.category,
        "unit": material.unit,
        "price_per_unit": material.price_per_unit,
        "quantity": material.quantity,
        "threshold": material.threshold,
        "status": get_status(material),
        "properties": props
    }

# =========================
# 🔹 DELETE MATERIAL
# =========================
@router.delete("/materials/{material_id}")
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Admin", "Owner"]))  # 🔥 stricter auth
):
    material = db.query(Material).get(material_id)

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    db.delete(material)
    db.commit()

    return {"message": "Material deleted"}


# =========================
# 🔹 WITHDRAW STOCK
# =========================
@router.post("/materials/{material_id}/withdraw")
def withdraw_material(
    material_id: int,
    action: StockAction,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    material = db.query(Material).get(material_id)

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    if material.quantity < action.amount:
        raise HTTPException(status_code=400, detail="Not enough stock")

    # 🔒 SAFETY CHECK (IMPORTANT)
    #if action.username != user["username"]:
    #    raise HTTPException(status_code=403, detail="Username mismatch")

    # ✅ Update stock
    material.quantity -= action.amount

    # ✅ Log transaction
    transaction = MaterialTransaction(
        material_id=material_id,
        username=action.username,
        action_type="withdraw",
        amount=action.amount,
        note=action.note
    )

    db.add(transaction)
    db.commit()

    return {
        "message": "Stock withdrawn",
        "new_quantity": material.quantity
    }


# =========================
# 🔹 RECEIVE STOCK
# =========================
@router.post("/materials/{material_id}/receive")
def receive_material(
    material_id: int,
    action: StockAction,
    db: Session = Depends(get_db),
    user=Depends(require_role(["Staff", "Admin", "Owner"]))
):
    material = db.query(Material).get(material_id)

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # 🔒 SAFETY CHECK
    #if action.username != user["username"]:
    #    raise HTTPException(status_code=403, detail="Username mismatch")

    # ✅ Update stock
    material.quantity += action.amount

    # ✅ Log transaction
    transaction = MaterialTransaction(
        material_id=material_id,
        username=action.username,
        action_type="receive",
        amount=action.amount,
        note=action.note
    )

    db.add(transaction)
    db.commit()

    return {
        "message": "Stock received",
        "new_quantity": material.quantity
    }