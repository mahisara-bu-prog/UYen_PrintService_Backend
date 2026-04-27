#
#!! For Database Work Only


from sqlalchemy import Column, Integer, String, Boolean, DateTime ,ForeignKey,Text,Date ,DECIMAL ,TIMESTAMP ,Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base ,relationship
from datetime import datetime, timezone,UTC
Base = declarative_base()


class Staff(Base):
    __tablename__ = "staff_users"

    user_id = Column("USER_ID",Integer, primary_key=True, index=True)

    name = Column("NAME",String(100), nullable=False)
    email = Column("Email",String(100), nullable=False, unique=True, index=True)
    phone = Column("Phone_No",String(20), nullable=False)

    user_name = Column("username",String(50), nullable=False, unique=True, index=True)
    password_hashed = Column("password_hash",String(200), nullable=False)

    # Store role as string (handled by Enum in schemas.py)
    user_role = Column("user_role",String(20), nullable=False)

    user_status = Column("user_status",Boolean, default=True, nullable=False)

    create_date = Column(
        "create_date",
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    last_modified = Column(
        "last_modified",
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

"""
class Customer(Base):
    __tablename__ = "customers"

    Customer_ID = Column(Integer, primary_key=True)
    NAME = Column(String(100))
    Email = Column(String(100))
    Phone_No = Column(String(20))
    username = Column(String(50))
    password = Column(String(200))
"""

class Customer(Base):
    __tablename__ = "customers"

    Customer_ID = Column(Integer, primary_key=True, index=True)
    NAME = Column(String(100), nullable=False)
    Email = Column(String(100), unique=True)
    Phone_No = Column(String(20))
    username = Column(String(50), unique=True)
    password_hash = Column(String(200))
    suspended_status = Column(Boolean, default=False)
    create_date = Column(DateTime)
    last_modified = Column(DateTime)

# class Customer(Base):
#     __tablename__ = "customers"

#     customer_id = Column(Integer, primary_key=True, index=True)
    
#     name = Column(String(100), nullable=False)
#     email = Column(String(100), unique=True, nullable=False, index=True)
#     phone_no = Column(String(20), nullable=False)

#     username = Column(String(50), unique=True, nullable=False, index=True)
#     password_hash = Column(String(255), nullable=False)

#     suspended_status = Column(Boolean, default=False)

#     create_date = Column(DateTime(timezone=True), server_default=func.now())
#     last_modified = Column(DateTime(timezone=True), onupdate=func.now())




class WalkinSession(Base):
    __tablename__ = "walkin_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_token = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    expires_at = Column(DateTime)


# class Order(Base):
#     __tablename__ = "orders"

#     order_id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("customers.Customer_ID"))

#     file_path = Column(String(500))
#     file_name = Column(String(255))

#     paper_size_id = Column(Integer, ForeignKey("paper_sizes.paper_size_id"))
#     paper_type_id = Column(Integer, ForeignKey("paper_types.paper_type_id"))

#     copy_amount = Column(Integer)

#     price_per_unit = Column(DECIMAL(10,2))
#     total_price = Column(DECIMAL(10,2))

#     status = Column(String(20), default="pending") #? Pending ,Printing ,Complete ,Cancelled

#     order_received_date = Column(DateTime, default=datetime.now(timezone.utc))
#     pickup_date = Column(DateTime)

#     note = Column(Text)

#     created_date = Column(DateTime, default=datetime.now(timezone.utc))
#     last_modified_date = Column(DateTime, default=datetime.now(timezone.utc))


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("customers.customer_id"))

    file_path = Column(String(500))
    file_name = Column(String(255))

    # ✅ FIXED: use FK instead of string
    paper_size_id = Column(Integer, ForeignKey("paper_sizes.paper_size_id"))
    paper_type_id = Column(Integer, ForeignKey("paper_types.paper_type_id"))

    copy_amount = Column(Integer)

    price_per_unit = Column(DECIMAL(10,2))
    total_price = Column(DECIMAL(10,2))

    status = Column(String(20), default="pending")

    order_received_date = Column(DateTime, default=datetime.now(timezone.utc))
    pickup_date = Column(DateTime)

    note = Column(Text)

    created_date = Column(DateTime, default=datetime.now(timezone.utc))
    last_modified_date = Column(DateTime, default=datetime.now(timezone.utc))


class PaperSize(Base):
    __tablename__ = "paper_sizes"

    paper_size_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_date = Column(DateTime, default=datetime.now(timezone.utc))

class PaperType(Base):
    __tablename__ = "paper_types"

    paper_type_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_date = Column(DateTime, default=datetime.now(timezone.utc))



class Material(Base):
    __tablename__ = "materials"

    material_id = Column(Integer, primary_key=True, index=True)
    material_name = Column(String(150))
    category = Column(String(100))

    unit = Column(String(50))
    price_per_unit = Column(DECIMAL(10,2))

    quantity = Column(Integer, default=0)
    threshold = Column(Integer, default=0)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    properties = relationship("MaterialProperty", back_populates="material", cascade="all, delete")


class MaterialProperty(Base):
    __tablename__ = "material_properties"

    property_id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.material_id"))

    property_name = Column(String(100))
    property_value = Column(String(100))

    material = relationship("Material", back_populates="properties")

class MaterialTransaction(Base):
    __tablename__ = "material_transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)

    material_id = Column(Integer, ForeignKey("materials.material_id"), nullable=False)

    # ✅ now using username
    username = Column(String(50), nullable=False)

    action_type = Column(
        Enum("withdraw", "receive", name="action_type_enum"),
        nullable=False
    )

    amount = Column(Integer, nullable=False)
    note = Column(Text)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))


# class MaterialTransaction(Base):
#     __tablename__ = "material_transactions"
#     #__table_args__ = {'extend_existing': True}
#     transaction_id = Column(Integer, primary_key=True, index=True)

#     material_id = Column(Integer, ForeignKey("materials.material_id"), nullable=False)

#     # ✅ now using username
#     username = Column(String(50), nullable=False)

#     action_type = Column(
#         Enum("withdraw", "receive", name="action_type_enum"),
#         nullable=False
#     )

#     amount = Column(Integer, nullable=False)
#     note = Column(Text)

#     created_at = Column(DateTime, default=datetime.now(timezone.utc))

# class MaterialTransaction(Base):
#     __tablename__ = "material_transactions"

#     transaction_id = Column(Integer, primary_key=True, index=True)

#     material_id = Column(Integer, ForeignKey("materials.material_id"), nullable=False)

#     username = Column(String(50), nullable=False)

#     action_type = Column(String(20), nullable=False)  # 🔥 simpler than Enum

#     amount = Column(Integer, nullable=False)
#     note = Column(Text)

#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# class MaterialTransaction(Base):
#     __tablename__ = "material_transactions"

#     transaction_id = Column(Integer, primary_key=True)

#     material_id = Column(Integer, ForeignKey("materials.material_id"))
#     username = Column(String(50))

#     action_type = Column(String(20))
#     amount = Column(Integer)

#     note = Column(Text)
#     created_at = Column(DateTime)