# Setup Checklist ✅

Use this checklist to track your setup progress.

## Prerequisites

- [ ] Python 3.11+ installed
  - Check: `python --version`
- [ ] Node.js 18+ installed
  - Check: `node --version`
- [ ] PostgreSQL 16+ installed
  - Check: `postgres --version`
- [ ] Gemini API key obtained
  - Get from: https://aistudio.google.com/app/apikey

---

## Database Setup

- [ ] PostgreSQL service is running
  - Windows: Check `services.msc` → postgresql-x64-16
- [ ] Connected to PostgreSQL
  - `psql -U postgres`
- [ ] Created database `imagedb`
  - `CREATE DATABASE imagedb;`
- [ ] Created user `imageapp`
  - `CREATE USER imageapp WITH PASSWORD 'your_password';`
- [ ] Granted privileges
  - `GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;`
- [ ] Connected to imagedb
  - `\c imagedb`
- [ ] Installed pgvector extension
  - `CREATE EXTENSION vector;`
- [ ] Exited psql
  - `\q`

---

## Configuration

- [ ] `.env` file exists in project root
  - File: `C:\Files\JaziriX\Archive\.env`
- [ ] Updated DATABASE_URL with PostgreSQL password
  - Line 2: `DATABASE_URL=postgresql://imageapp:YOUR_PASSWORD@localhost:5432/imagedb`
- [ ] Updated DB_PASSWORD
  - Line 4: `DB_PASSWORD=YOUR_PASSWORD`
- [ ] Gemini API key is set ✅ (Already done!)
  - Line 14: `GEMINI_API_KEY=AIzaSy...`
- [ ] JWT_SECRET is secure (optional - already set)
  - Line 8: Consider changing to a longer random string

---

## Backend Setup

- [ ] Opened Command Prompt in project directory
- [ ] Ran backend startup script
  - `start-backend.bat`
- [ ] Virtual environment created
  - Should see: "Creating virtual environment..."
- [ ] Dependencies installed (wait 5-10 min on first run)
  - Should see: "Installing dependencies..."
- [ ] CLIP model downloaded
  - Should see: "Loading CLIP model..."
- [ ] Backend started successfully
  - Should see: "Uvicorn running on http://0.0.0.0:8000"
- [ ] Tested API docs
  - Visit: http://localhost:8000/docs

---

## Frontend Setup

- [ ] Opened NEW Command Prompt (keep backend running!)
- [ ] Ran frontend startup script
  - `start-frontend.bat`
- [ ] npm packages installed (wait 2-3 min on first run)
  - Should see: "Installing dependencies..."
- [ ] Frontend started successfully
  - Should see: "VITE v5.0.11 ready in 500 ms"
- [ ] Tested frontend
  - Visit: http://localhost:3000

---

## Application Testing

- [ ] Registration page loads
  - http://localhost:3000
- [ ] Can create new account
  - Email: `test@example.com`
  - Password: `password123`
- [ ] Logged in successfully
  - Redirected to dashboard
- [ ] Upload area visible
  - Drag & drop or click to upload
- [ ] Image uploaded successfully
  - Uploaded a test image
- [ ] CLIP tags generated
  - Tags appear below image
- [ ] Image appears in gallery
  - Visible in grid view
- [ ] Search works
  - Searched for a tag (e.g., "person")
  - Results appear
- [ ] AI Assistant tab loads
  - Clicked "AI Assistant" button
- [ ] Can chat with AI
  - Sent message: "What images do I have?"
  - AI responded with relevant information

---

## Verification

Run these checks to verify everything works:

### Backend Health
- [ ] http://localhost:8000 shows welcome message
- [ ] http://localhost:8000/docs shows Swagger UI
- [ ] http://localhost:8000/health returns `{"status": "healthy"}`

### Database Connection
```cmd
psql -U imageapp -d imagedb -c "\dt"
```
- [ ] Shows tables: users, images, image_tags, image_versions

### Image Upload Flow
- [ ] Upload image → No errors
- [ ] Wait 5-10 seconds → Tags generated
- [ ] Image in database → Run:
  ```cmd
  psql -U imageapp -d imagedb -c "SELECT id, filename FROM images;"
  ```

### AI Features
- [ ] Chat sends messages
- [ ] AI responds with relevant information
- [ ] Can view uploaded images in uploads folder

---

## Common Issues (If Checked)

If any check above failed, see the issue:

### ❌ PostgreSQL won't start
- Open Services (`services.msc`)
- Find postgresql-x64-16
- Right-click → Start

### ❌ Backend ModuleNotFoundError
```cmd
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### ❌ Backend can't find .env
- Make sure file is at `C:\Files\JaziriX\Archive\.env`
- Check it has content: `type .env`

### ❌ Frontend port 3000 in use
```cmd
netstat -ano | findstr :3000
taskkill /PID <number> /F
```

### ❌ Images not uploading
- Check backend terminal for errors
- Open browser DevTools (F12) → Console
- Verify Gemini API key is correct

---

## Success! 🎉

When all items are checked:

✅ Backend running on http://localhost:8000
✅ Frontend running on http://localhost:3000
✅ Can create account and login
✅ Can upload images with auto-tagging
✅ Can search images by tags
✅ AI Assistant works

---

## Quick Reference

### Start Application
```cmd
REM Terminal 1
start-backend.bat

REM Terminal 2
start-frontend.bat
```

### Stop Application
- Press `Ctrl+C` in each terminal

### View Database
```cmd
psql -U imageapp -d imagedb
SELECT * FROM images;
\q
```

### Reset Everything
```cmd
REM Stop both terminals (Ctrl+C)
REM Reset database
psql -U postgres
DROP DATABASE imagedb;
CREATE DATABASE imagedb;
GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
\c imagedb
CREATE EXTENSION vector;
\q

REM Start again
start-backend.bat  (in new terminal)
start-frontend.bat (in new terminal)
```

---

**Need help?** See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for detailed troubleshooting.
