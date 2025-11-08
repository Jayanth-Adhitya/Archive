# Docker Setup Guide

This guide will help you run the AI Image Archive application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Gemini API key

## Quick Start

### 1. Environment Setup

Make sure your `.env` file in the root directory contains:

```env
# Database
DB_USER=imageapp
DB_PASSWORD=changeme123
DB_NAME=imagedb

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Gemini AI API
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Note:** The `.env` file is already configured in the root directory. Just make sure the `GEMINI_API_KEY` is set.

### 2. Build and Run

From the root directory, run:

```bash
docker-compose up --build
```

This will:
- Start PostgreSQL database with pgvector extension
- Build and start the FastAPI backend
- Build and start the React frontend with Nginx

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

### 4. Default User

The application creates a default user on first run:
- **Email**: demo@example.com
- **Password**: demo123

You can also register a new account.

## Docker Commands

### Start services (detached mode)
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop services and remove volumes (WARNING: deletes all data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Restart a specific service
```bash
docker-compose restart backend
docker-compose restart frontend
```

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is healthy: `docker-compose ps`
- View backend logs: `docker-compose logs backend`
- Ensure `.env` file has all required variables

### Frontend can't connect to backend
- The nginx.conf proxies `/api` and `/uploads` to the backend
- Check nginx logs: `docker-compose logs frontend`
- Verify backend is running: `docker-compose ps`

### Database connection issues
- Wait for PostgreSQL health check to pass
- Check connection string in backend logs
- Verify database credentials in `.env`

### Port conflicts
If ports 80, 8000, or 5432 are already in use, modify `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3000:80"  # Change 80 to your preferred port

  backend:
    ports:
      - "8001:8000"  # Change 8000 to your preferred port

  postgres:
    ports:
      - "5433:5432"  # Change 5432 to your preferred port
```

## Development vs Production

### Development (local)
Uses local environment with hot reload:
- Backend: http://localhost:8001
- Frontend: http://localhost:5173

### Production (Docker)
Uses containerized environment:
- Frontend serves at http://localhost
- Backend at http://localhost:8000
- All requests proxied through Nginx

## Data Persistence

Docker volumes are used for data persistence:
- `postgres_data`: Database files
- `uploads_data`: Uploaded images

These persist even when containers are stopped. To remove them:
```bash
docker-compose down -v
```

## Updating the Application

1. Pull latest code
2. Rebuild containers:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## Security Notes

**For Production Deployment:**
1. Change `JWT_SECRET` to a strong random value
2. Use strong database password
3. Don't expose PostgreSQL port publicly
4. Use HTTPS with proper SSL certificates
5. Set `ENVIRONMENT=production` in `.env`
6. Never commit `.env` file to version control
