# Deployment Guide for Coolify

## Architecture
- **Frontend**: https://archive.mehh.ae
- **Backend**: https://api.archive.mehh.ae
- **Database**: Internal PostgreSQL (not exposed)

## Deploy Backend (api.archive.mehh.ae)

### 1. In Coolify, create new resource:
- Choose: Git Repository
- Repository: Your git repo URL
- Branch: main
- Build Pack: Dockerfile
- Dockerfile Location: `backend/Dockerfile`
- Base Directory: `backend`

### 2. Set Domain:
- Domain: `api.archive.mehh.ae`

### 3. Set Port:
- Port: `8000`

### 4. Environment Variables:
```
DATABASE_URL=postgresql://imageapp:CHANGE_ME@postgres:5432/imagedb
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=.jpg,.jpeg,.png,.gif,.webp
CORS_ORIGINS=https://archive.mehh.ae,http://archive.mehh.ae
BACKEND_URL=https://api.archive.mehh.ae
ENVIRONMENT=production
```

### 5. PostgreSQL Database:
In Coolify, add a PostgreSQL database service:
- Database Name: `imagedb`
- Username: `imageapp`
- Password: (set your own)
- Connect to backend service

## Deploy Frontend (archive.mehh.ae)

### 1. In Coolify, create new resource:
- Choose: Git Repository
- Repository: Your git repo URL
- Branch: main
- Build Pack: Dockerfile
- Dockerfile Location: `frontend/Dockerfile`
- Base Directory: `frontend`

### 2. Set Domain:
- Domain: `archive.mehh.ae`

### 3. Set Port:
- Port: `80`

### 4. Build Arguments (if needed):
```
VITE_API_URL=https://api.archive.mehh.ae/api
```

## Post-Deployment

### Test the deployment:
1. Visit https://archive.mehh.ae
2. Register a new account
3. Upload an image
4. Check if images load correctly

### Default Demo Account:
- Email: demo@example.com
- Password: demo123

## Troubleshooting

### CORS Errors:
- Check backend CORS_ORIGINS includes your frontend domain
- Ensure both HTTP and HTTPS versions are included

### Images not loading:
- Images are served from backend: `https://api.archive.mehh.ae/uploads/...`
- Check backend logs for 404 errors

### Database connection issues:
- Ensure PostgreSQL service is healthy
- Check DATABASE_URL format is correct
- Verify database is in same network as backend

### Build failures:
- Check Dockerfile paths are correct
- Ensure all required files are committed to git
- Check build logs for missing dependencies
