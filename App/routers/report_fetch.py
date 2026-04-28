from fastapi import APIRouter
from typing import List
from report_service import fetch_data

router = APIRouter(
    prefix="/report-fetch",
    tags=["Report Fetch"]
)


@router.get("/orders-by-date")
def fetch_orders_by_date(start_date: str, end_date: str):
    
    query = """
    SELECT 
        DATE_FORMAT(order_received_date, '%Y-%m') AS month,
        DATE(order_received_date) AS date,
        order_id,
        copy_amount,
        price_per_unit,
        (copy_amount * price_per_unit) AS total_price,
        status
    FROM orders
    WHERE order_received_date BETWEEN %s AND %s
    ORDER BY month, date, order_id;
    """

    columns, rows = fetch_data(query, (start_date, end_date))

    # Convert to JSON
    data = [dict(zip(columns, row)) for row in rows]

    return {
        "total": len(data),
        "data": data
    }




@router.get("/orders-by-month")
def fetch_orders_by_month(start_month: str = None, end_month: str = None):
    """
    Optional:
    start_month = "2026-01"
    end_month   = "2026-12"
    """

    query = """
    SELECT 
        DATE_FORMAT(order_received_date, '%Y-%m') AS month,
        order_id,
        copy_amount,
        price_per_unit,
        (copy_amount * price_per_unit) AS total_price,
        status
    FROM orders
    """

    params = []

    # 🔹 Optional filtering by month range
    if start_month and end_month:
        query += """
        WHERE DATE_FORMAT(order_received_date, '%Y-%m') BETWEEN %s AND %s
        """
        params = [start_month, end_month]

    query += """
    ORDER BY month, order_received_date, order_id;
    """

    columns, rows = fetch_data(query, tuple(params))

    # Convert to JSON
    data = [dict(zip(columns, row)) for row in rows]

    return {
        "total": len(data),
        "data": data
    }


@router.get("/stock_report_fetch/")
def stock_report_json():

    query = """
    SELECT 
        material_id,
        material_name,
        category,
        quantity,
        unit,
        price_per_unit,
        updated_at
    FROM materials
    """

    columns, rows = fetch_data(query)

    data = [dict(zip(columns, row)) for row in rows]

    return {
        "total": len(data),
        "data": data
    }

@router.get("/withdraw_report_fetch/")
def stock_report_json():

    query = """
    SELECT transaction_id ,
        material_id ,
        username ,
        action_type ,
        amount, created_at
    FROM material_transactions
    WHERE action_type = 'withdraw'
    """

    columns, rows = fetch_data(query)

    data = [dict(zip(columns, row)) for row in rows]

    return {
        "total": len(data),
        "data": data
    }

@router.get("/receive_report_fetch/")
def stock_report_json():

    query = """
    SELECT transaction_id ,
        material_id ,
        username ,
        action_type ,
        amount, created_at
    FROM material_transactions
    WHERE action_type = 'receive'
    """

    columns, rows = fetch_data(query)

    data = [dict(zip(columns, row)) for row in rows]

    return {
        "total": len(data),
        "data": data
    }