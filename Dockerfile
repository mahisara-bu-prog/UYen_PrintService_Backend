# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /App

# Install system dependencies
RUN apt-get update && apt-get install -y gcc default-libmysqlclient-dev

# Copy requirements
COPY requirements.txt . 

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY ./App /App

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]