# Use Python base image
FROM python:3.12

# Set working directory in the container
WORKDIR /app

# Copy requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend folder to preserve module structure
COPY backend /app/backend

# Set PYTHONPATH to include /app
ENV PYTHONPATH="/app"

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Run the Flask app
CMD ["hypercorn", "backend.app:app", "--bind", "0.0.0.0:8080"]
