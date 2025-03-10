# Use Python base image
FROM python:3.12

# Set working directory in the container
WORKDIR /app

# Copy requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY backend/ .

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Run the Flask app
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--timeout", "120", "backend.app:app"]
