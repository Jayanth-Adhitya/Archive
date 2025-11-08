# Setup Instructions - Step by Step

## ✅ Pre-Setup Checklist

Before you start:
- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 16+ installed
- [ ] Your `.env` file has your Gemini API key ✅ (Already done!)

---

## Step 1: Setup PostgreSQL Database

### Windows (using Command Prompt)

1. **Open Command Prompt as Administrator**

2. **Connect to PostgreSQL**:
   ```cmd
   psql -U postgres
   ```
   Enter the password you set during PostgreSQL installation.

3. **Create the database and user**:
   ```sql
   CREATE DATABASE imagedb;
   CREATE USER imageapp WITH PASSWORD 'changeme123';
   GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
   \c imagedb
   CREATE EXTENSION vector;
   \q
   ```

4. **Update your .env file**:
   - Line 2: `DATABASE_URL=postgresql://imageapp:changeme123@localhost:5432/imagedb`
   - Line 4: `DB_PASSWORD=changeme123`

   (Or use your own password instead of `changeme123`)

### Verify PostgreSQL is Running

```cmd
REM Windows - Check service
sc query postgresql

REM If not running, start it
net start postgresql-x64-16
```

---

## Step 2: Setup Backend (Python/FastAPI)

### Option A: Using the Startup Script (Recommended)

1. **Double-click** `start-backend.bat`

   OR from Command Prompt:
   ```cmd
   start-backend.bat
   ```

2. **First run will**:
   - Create virtual environment
   - Install all Python packages (~5-10 minutes)
   - Download CLIP model (~1.5GB)
   - Start the server

3. **You'll see**:
   ```
   Loading CLIP model on cpu...
   CLIP model loaded successfully with 80 categories
   INFO:     Uvicorn running on http://0.0.0.0:8000
   INFO:     Application startup complete.
   ```

4. **Test it**: Visit http://localhost:8000/docs

### Option B: Manual Setup

1. **Open Command Prompt in the project directory**

2. **Navigate to backend**:
   ```cmd
   cd backend
   ```

3. **Create virtual environment**:
   ```cmd
   python -m venv venv
   ```

4. **Activate virtual environment**:
   ```cmd
   venv\Scripts\activate
   ```

   You should see `(venv)` in your prompt.

5. **Upgrade pip**:
   ```cmd
   python -m pip install --upgrade pip
   ```

6. **Install dependencies**:
   ```cmd
   pip install -r requirements.txt
   ```

   ⏳ This takes 5-10 minutes and downloads ~2GB

7. **Start the backend**:
   ```cmd
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

8. **Verify**: Visit http://localhost:8000/docs

---

## Step 3: Setup Frontend (React)

### Option A: Using the Startup Script (Recommended)

1. **Open a NEW Command Prompt** (keep backend running!)

2. **Double-click** `start-frontend.bat`

   OR from Command Prompt:
   ```cmd
   start-frontend.bat
   ```

3. **First run will**:
   - Install npm packages (~2-3 minutes)
   - Start development server

4. **You'll see**:
   ```
   VITE v5.0.11  ready in 500 ms
   ➜  Local:   http://localhost:3000/
   ```

5. **Test it**: Visit http://localhost:3000

### Option B: Manual Setup

1. **Open a NEW Command Prompt** (keep backend running!)

2. **Navigate to frontend**:
   ```cmd
   cd frontend
   ```

3. **Install dependencies**:
   ```cmd
   npm install
   ```

   ⏳ This takes 2-3 minutes

4. **Start the development server**:
   ```cmd
   npm run dev
   ```

5. **Verify**: Visit http://localhost:3000

---

## Step 4: Test the Application

### 1. Create an Account

1. Visit http://localhost:3000
2. Click **"Register"**
3. Enter:
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click **"Register"**

You'll be automatically logged in!

### 2. Upload an Image

1. Drag and drop any image onto the upload area
2. Wait ~5-10 seconds while:
   - Image is uploaded
   - CLIP analyzes it
   - Tags are generated
3. Your image appears in the gallery with tags!

### 3. Search for Images

1. In the search bar, type a tag (e.g., `person`, `outdoor`, `cat`)
2. Press **Enter**
3. See matching images

### 4. Try the AI Assistant

1. Click **"AI Assistant"** in the header
2. Type: `What images do I have?`
3. Press **Enter**
4. The AI will respond with information about your archive!

Try asking:
- "Show me all photos with people"
- "Help me find images for a newsletter about cats"
- "When was my last photo uploaded?"

---

## Troubleshooting

### Backend Issues

#### ❌ Error: "ModuleNotFoundError: No module named 'pydantic_settings'"

**Fix**: Make sure you activated the virtual environment:
```cmd
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

#### ❌ Error: "Could not connect to database"

**Fix**: PostgreSQL is not running
```cmd
REM Start PostgreSQL
net start postgresql-x64-16

REM Or check Services (services.msc)
```

#### ❌ Error: "Field required [type=missing]" for DATABASE_URL

**Fix**: The `.env` file is not being found

1. Check `.env` exists in project root:
   ```cmd
   dir .env
   ```

2. Verify it has content:
   ```cmd
   type .env
   ```

3. Make sure you're running from the correct directory

#### ❌ CLIP Model Download is Slow

This is normal on first run. The model is ~1.5GB. Just wait patiently.

If it fails:
```cmd
cd backend
venv\Scripts\activate
python -c "from transformers import CLIPModel, CLIPProcessor; CLIPModel.from_pretrained('openai/clip-vit-large-patch14'); CLIPProcessor.from_pretrained('openai/clip-vit-large-patch14')"
```

### Frontend Issues

#### ❌ Port 3000 already in use

**Option 1**: Kill the process
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Option 2**: Change the port in `frontend/vite.config.js`

#### ❌ "Failed to fetch" when uploading

1. Make sure backend is running on port 8000
2. Check browser console (F12) for errors
3. Verify CORS settings in backend `.env`

#### ❌ Images not displaying

1. Check uploads directory exists: `uploads/`
2. Check backend is serving static files
3. Open browser DevTools → Network tab to see requests

### Database Issues

#### ❌ Cannot connect to PostgreSQL

```cmd
REM Check if PostgreSQL is installed
postgres --version

REM Check if it's running
sc query postgresql-x64-16

REM Start it
net start postgresql-x64-16
```

#### ❌ "Extension vector does not exist"

Install pgvector:
1. Download from: https://github.com/pgvector/pgvector/releases
2. Follow Windows installation instructions
3. Reconnect to database and run: `CREATE EXTENSION vector;`

---

## File Locations

### Configuration
- **Main .env**: `C:\Files\JaziriX\Archive\.env` ✅
- **Backend config**: `backend/app/core/config.py`
- **Frontend config**: `frontend/vite.config.js`

### Scripts
- **Backend startup**: `start-backend.bat`
- **Frontend startup**: `start-frontend.bat`
- **Docker setup**: `setup.bat`

### Uploads
- Images saved to: `uploads/<user_id>/`

### Database
- PostgreSQL data: Check PostgreSQL installation directory

---

## Quick Commands Reference

### Start Everything
```cmd
REM Terminal 1 - Backend
start-backend.bat

REM Terminal 2 - Frontend
start-frontend.bat
```

### Stop Everything
- Press `Ctrl+C` in each terminal

### Reset Database
```cmd
psql -U postgres
DROP DATABASE imagedb;
CREATE DATABASE imagedb;
GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
\c imagedb
CREATE EXTENSION vector;
\q
```

### View Logs

**Backend**: Look at terminal running `start-backend.bat`

**Frontend**: Look at terminal running `start-frontend.bat`

**Database**:
```cmd
psql -U imageapp -d imagedb
SELECT * FROM images;
\q
```

---

## What to Expect

### First Run Performance

| Step | Time | Size |
|------|------|------|
| Create venv | 30 sec | 50MB |
| Install Python packages | 5-10 min | 2GB |
| Install npm packages | 2-3 min | 200MB |
| **Total First Time** | **8-15 min** | **~2.5GB** |

### Subsequent Runs
- Backend: Starts in 5 seconds
- Frontend: Starts in 3 seconds

### Resource Usage
- RAM: ~2.5GB (mainly CLIP model)
- CPU: Moderate during image upload
- Disk: ~5GB total

---

## Success Indicators

You'll know everything is working when:

✅ Backend terminal shows:
```
Loading CLIP model on cpu...
CLIP model loaded successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Frontend terminal shows:
```
VITE v5.0.11  ready in 500 ms
➜  Local:   http://localhost:3000/
```

✅ Browser shows:
- Registration page loads
- You can create account
- You can upload images
- Tags are auto-generated
- Search works
- AI Assistant responds

---

## Next Steps After Setup

1. **Upload test images** - Try different types (people, landscapes, objects)
2. **Test search** - Search for various tags
3. **Try AI features** - Ask the assistant questions
4. **Customize theme** - Edit `frontend/src/index.css`
5. **Add features** - Follow the code structure to add new functionality

---

## Getting Additional Help

If you encounter issues:

1. **Check the error message** carefully
2. **Review this troubleshooting section**
3. **Check logs** in both terminals
4. **Verify PostgreSQL** is running
5. **Test each component** separately

### Useful Test Commands

```cmd
REM Test backend config
cd backend
venv\Scripts\activate
python -c "from app.core.config import settings; print('Config OK!')"

REM Test database connection
psql -U imageapp -d imagedb -c "SELECT version();"

REM Test frontend build
cd frontend
npm run build
```

---

You're all set! Follow the steps above and you'll have the application running in ~15 minutes. 🚀
