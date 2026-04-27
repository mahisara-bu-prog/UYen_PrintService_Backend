from fastapi import APIRouter
from fastapi.responses import FileResponse

from report_service import generate_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/orders-by-date")
def report_orders_by_date(start_date: str, end_date: str):

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

    file_path = generate_pdf(
        query=query,
        title_text="Total Orders by Date",
        filename="orders_by_date.pdf",
        params=(start_date, end_date)
    )

    return FileResponse(file_path, filename="orders_by_date.pdf")


@router.get("/orders-by-month")
def report_orders_by_month():

    query = """
        SELECT 
            DATE_FORMAT(order_received_date, '%Y-%m') as month,
            order_id,
            copy_amount,
            price_per_unit,
            (copy_amount * price_per_unit) AS total_price,
            status
        FROM orders
        ORDER BY month, order_received_date;
    """

    file_path = generate_pdf(
        query=query,
        title_text="Total Orders by Month",
        filename="orders_by_month.pdf"
    )

    return FileResponse(file_path, filename="orders_by_month.pdf")


@router.get("/stockreport")
def stock_report():

    query = """
    SELECT material_id ,material_name , category ,quantity ,unit, price_per_unit, updated_at
    FROM materials
    """

    file_path = generate_pdf(
        query=query,
        title_text="Stock Report",
        filename="stock_report.pdf"
    )

    return FileResponse(file_path, filename="stock_report.pdf")