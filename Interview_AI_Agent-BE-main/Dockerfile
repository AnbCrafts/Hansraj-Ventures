FROM python:3.12-slim

# Create working directory
WORKDIR /app

# Copy requirement file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all code
COPY . .

# Default command (overridden by docker-compose)
CMD ["python", "backend/server/app.py"]