# START HERE - Quick Reference

## ✅ Issues Fixed

1. **Configuration Error Fixed**: `ALLOWED_EXTENSIONS` parsing error resolved
2. **Local Development Ready**: Complete setup guide created
3. **Quick Start Scripts**: Easy-to-use startup scripts added

---

## 🚀 Choose Your Path

### Option A: Local Development (Recommended for Testing)

**Perfect for**: Testing, development, customization

**Requirements**:
- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Your Gemini API key

**Steps**:
1. Read: [LOCAL_SETUP.md](LOCAL_SETUP.md) - Complete guide
2. Follow the setup instructions
3. Use the quick start scripts below

### Option B: Docker Deployment

**Perfect for**: Production, quick demo, Coolify deployment

**Requirements**:
- Docker Desktop
- Your Gemini API key

**Steps**:
1. Read: [QUICKSTART.md](QUICKSTART.md)
2. Run: `setup.bat` (Windows) or `./setup.sh` (Linux/Mac)
3. Access: http://localhost

---

## 🏃 Quick Start (Local Development)

### 1. Setup Database (One Time)

**Windows**: Open PowerShell as Administrator
```powershell
# Install PostgreSQL first, then:
psql -U postgres
```

**Linux/Mac**:
```bash
sudo -u postgres psql
```

**In psql shell**:
```sql
CREATE DATABASE imagedb;
CREATE USER imageapp WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
\c imagedb
CREATE EXTENSION vector;
\q
```

### 2. Configure Environment (One Time)

Your [.env](.env:1) file is already created! Just update:
- Line 2: Change `your_password_here` to your PostgreSQL password
- Line 8: Make JWT_SECRET longer and more random

**Your Gemini API key is already set!** ✅

### 3. Start Services

**Terminal 1 - Backend**:
```bash
# Windows
start-backend.bat

# Linux/Mac
chmod +x start-backend.sh
./start-backend.sh
```

**Terminal 2 - Frontend**:
```bash
# Windows
start-frontend.bat

# Linux/Mac
chmod +x start-frontend.sh
./start-frontend.sh
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📁 Project Structure

```
Archive/
├── backend/              # FastAPI + Python
│   ├── app/
│   │   ├── api/         # REST endpoints
│   │   ├── services/    # CLIP & Gemini AI
│   │   └── models/      # Database models
│   └── requirements.txt
├── frontend/            # React + Tailwind
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Routes
│   │   └── store/       # State management
│   └── package.json
├── .env                 # Your configuration ✅
├── docker-compose.yml   # Docker setup
└── start-*.bat/sh       # Quick start scripts
```

---

## 🎯 What Works Now

✅ User authentication (signup/login)
✅ Image upload with drag-and-drop
✅ Automatic AI tagging (CLIP)
✅ Search by tags
✅ AI Assistant (Gemini)
✅ Beautiful UI (mehh.ae theme)
✅ Full REST API
✅ Docker deployment ready

---

## 📚 Documentation

- **[LOCAL_SETUP.md](LOCAL_SETUP.md)** - Complete local development guide (⭐ Read this first!)
- **[QUICKSTART.md](QUICKSTART.md)** - Docker quick start (5 minutes)
- **[README.md](README.md)** - Full documentation, features, API reference
- **API Docs** - http://localhost:8000/docs (once backend is running)

---

## 🔧 Common Commands

### Backend
```bash
cd backend
venv\Scripts\activate     # Windows
source venv/bin/activate  # Linux/Mac
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

### Database
```bash
# Connect to database
psql -U imageapp -d imagedb

# View tables
\dt

# View images
SELECT id, filename, upload_date FROM images;

# View tags
SELECT i.filename, t.tag, t.confidence
FROM images i
JOIN image_tags t ON i.id = t.image_id;
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: `Could not connect to database`
```bash
# Check PostgreSQL is running
# Windows: services.msc → look for postgresql
# Linux: sudo systemctl status postgresql
# Mac: brew services list
```

**Error**: `ModuleNotFoundError`
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend won't start

**Error**: `Port 3000 already in use`
```bash
# Kill the process or change port in vite.config.js
```

**Error**: `npm: command not found`
```bash
# Install Node.js from nodejs.org
```

### Images not uploading

1. Check backend is running on http://localhost:8000
2. Open browser DevTools (F12) → Console tab
3. Look for error messages
4. Verify Gemini API key in [.env](.env:14)

### AI Assistant not responding

1. Check Gemini API key in [.env](.env:14)
2. Check you haven't exceeded free tier (1,500 requests/day)
3. View backend logs in terminal

---

## 🎓 First Time Usage

### 1. Create Account
- Visit http://localhost:3000
- Click "Register"
- Email: `test@example.com`
- Password: `password123`

### 2. Upload Image
- Drag & drop an image
- Wait for AI tagging (~5-10 seconds)
- See auto-generated tags

### 3. Search
- Type: "cat" or "outdoor" or "person"
- Press Enter
- See matching images

### 4. AI Assistant
- Click "AI Assistant"
- Ask: "What images do I have?"
- Ask: "Help me find photos for a newsletter"

---

## 💡 Next Steps

### For Development
1. ✅ Get everything running locally
2. Upload test images
3. Test all features
4. Customize the theme (edit `frontend/src/index.css`)
5. Add new features

### For Production
1. Test locally first
2. Update security settings in `.env`
3. Use Docker: `docker-compose up -d`
4. Deploy to Coolify (see [README.md](README.md))

---

## 🆘 Getting Help

1. **Error messages**: Copy the exact error and check docs
2. **Backend issues**: Check `backend/` terminal for Python errors
3. **Frontend issues**: Check browser DevTools Console (F12)
4. **Database issues**: Run `psql -U imageapp -d imagedb`
5. **API issues**: Visit http://localhost:8000/docs

---

## 📊 System Requirements

**Minimum**:
- 4GB RAM
- 10GB disk space
- Dual-core CPU

**Recommended**:
- 8GB+ RAM (for CLIP model)
- 20GB+ disk space
- Quad-core CPU

**First Run**:
- Backend: Downloads ~1.5GB (CLIP model)
- Frontend: Downloads ~200MB (npm packages)
- Takes 5-10 minutes

**Subsequent Runs**:
- Instant startup
- Models cached

---

## 🎉 You're Ready!

Everything is configured and ready to go. Just:

1. **Setup PostgreSQL** (one time)
2. **Update `.env`** with your PostgreSQL password (one line)
3. **Run `start-backend.bat`** in one terminal
4. **Run `start-frontend.bat`** in another terminal
5. **Visit http://localhost:3000**

**Questions?** Check [LOCAL_SETUP.md](LOCAL_SETUP.md) for detailed instructions.

---

Good luck with your AI Image Archive platform! 🚀✨
