import os
import datetime
import mysql.connector

from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle,
    Paragraph, Image, Spacer
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def fetch_data(query, params=None):
    try:
        conn = mysql.connector.connect(
            host="mysql",
            user="root",
            password="root",
            database="my_db"
        )

        cursor = conn.cursor()
        cursor.execute(query, params or ())

        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]

        cursor.close()
        conn.close()

        return columns, rows

    except Exception as e:
        return ["Error"], [[str(e)]]


def generate_pdf(query, title_text, filename, params=None):
    file_path = os.path.join(BASE_DIR, filename)
    logo_path = os.path.join(BASE_DIR, "Group_466.png")

    columns, rows = fetch_data(query, params)
    data = [columns] + rows

    pdf = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()
    elements = []

    # Header
    if os.path.exists(logo_path):
        logo = Image(logo_path, width=100, height=50)
    else:
        logo = ""

    header = Table([[logo, Paragraph("<b>U-YEN Printing</b>", styles["Normal"])]])

    elements.append(header)
    elements.append(Spacer(1, 10))

    # Title
    elements.append(Paragraph(f"<b>{title_text}</b>", styles["Title"]))
    elements.append(Paragraph(
        f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}",
        styles["Normal"]
    ))

    elements.append(Spacer(1, 20))

    # Table
    table = Table(data, repeatRows=1)

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
    ]))

    elements.append(table)

    pdf.build(elements)

    return file_path