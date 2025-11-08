# Local Development Setup (Without Docker)

Complete guide to run the AI Image Archive platform on your local machine for development and testing.

## Prerequisites

### Required Software
1. **Python 3.11+** - [Download](https://www.python.org/downloads/)
2. **Node.js 18+** - [Download](https://nodejs.org/)
3. **PostgreSQL 16+** - [Download](https://www.postgresql.org/download/)
4. **Git** (optional) - [Download](https://git-scm.com/)

### API Keys
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Part 1: Database Setup (PostgreSQL)

### Windows

1. **Install PostgreSQL**
   - Download PostgreSQL 16 installer
   - During installation, set a password for the `postgres` user
   - Default port: 5432

2. **Install pgvector extension**
   - Download pgvector from: https://github.com/pgvector/pgvector/releases
   - Or install via Stack Builder in PostgreSQL installation

3. **Create database and user**
   ```bash
   # Open Command Prompt and run psql
   psql -U postgres

   # In psql shell:
   CREATE DATABASE imagedb;
   CREATE USER imageapp WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
   \c imagedb
   CREATE EXTENSION vector;
   \q
   ```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install build tools for pgvector
sudo apt install postgresql-server-dev-16 build-essential

# Install pgvector
cd /tmp
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Create database
sudo -u postgres psql

# In psql shell:
CREATE DATABASE imagedb;
CREATE USER imageapp WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
\c imagedb
CREATE EXTENSION vector;
\q
```

### macOS

```bash
# Install PostgreSQL with Homebrew
brew install postgresql@16

# Start PostgreSQL
brew services start postgresql@16

# Install pgvector
cd /tmp
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install

# Create database
psql postgres

# In psql shell:
CREATE DATABASE imagedb;
CREATE USER imageapp WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
\c imagedb
CREATE EXTENSION vector;
\q
```

---

## Part 2: Backend Setup (FastAPI)

### 1. Navigate to backend directory

```bash
cd backend
```

### 2. Create virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

**Note**: This will download:
- FastAPI and dependencies (~50MB)
- PyTorch (~800MB for CPU version)
- Transformers and CLIP model (~1.5GB)
- Other dependencies

**First run will take 5-10 minutes** to download everything.

### 4. Create `.env` file in project root

```bash
cd ..  # Go back to project root
```

Create a file named `.env` with:

```env
# Database Configuration
DATABASE_URL=postgresql://imageapp:your_password_here@localhost:5432/imagedb

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here

# Application Settings
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=.jpg,.jpeg,.png,.gif,.webp

# CORS (allow frontend to connect)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
ENVIRONMENT=development
```

**Important**: Replace:
- `your_password_here` with your PostgreSQL password
- `your_gemini_api_key_here` with your actual Gemini API key
- `your-super-secret-jwt-key-minimum-32-characters-long` with a random string

**Generate a secure JWT secret**:
```bash
# Python method
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use any random string generator
```

### 5. Start the backend

```bash
cd backend
# Make sure venv is activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Test the backend**: Visit http://localhost:8000/docs

---

## Part 3: Frontend Setup (React)

### 1. Open a NEW terminal (keep backend running)

### 2. Navigate to frontend directory

```bash
cd frontend
```

### 3. Install dependencies

```bash
npm install
```

This will take 2-3 minutes to download all packages.

### 4. Create `.env` file in frontend directory

```bash
# In frontend directory
# Create .env file (or copy from .env.example)
```

Content:
```env
VITE_API_URL=http://localhost:8000/api
```

### 5. Start the frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Access the application**: http://localhost:3000

---

## Testing the Application

### 1. Create an Account

1. Visit http://localhost:3000
2. Click "Register"
3. Enter email: `test@example.com`
4. Enter password: `password123`
5. Click "Register"

You'll be automatically logged in and redirected to the dashboard.

### 2. Upload an Image

1. On the dashboard, drag and drop an image
2. Or click the upload area to select a file
3. Wait for processing (CLIP will tag the image automatically)
4. Image appears in gallery with auto-generated tags

### 3. Search for Images

1. In the search bar, type a tag (e.g., "cat", "outdoor", "person")
2. Press Enter or click "Search"
3. Matching images appear

### 4. Use AI Assistant

1. Click "AI Assistant" in the header
2. Type: "What images do I have?"
3. AI will respond with information about your archive
4. Try: "Help me find photos of cats"

---

## Troubleshooting

### Backend Issues

#### Error: "Could not connect to database"
```bash
# Check PostgreSQL is running
# Windows:
services.msc  # Look for postgresql service

# Linux:
sudo systemctl status postgresql

# macOS:
brew services list
```

**Fix**:
```bash
# Windows:
# Start PostgreSQL service in services.msc

# Linux:
sudo systemctl start postgresql

# macOS:
brew services start postgresql@16
```

#### Error: "error parsing value for field ALLOWED_EXTENSIONS"
This is already fixed! If you still see it, make sure you have the latest code:
- Check [backend/app/core/config.py](backend/app/core/config.py:24) has `ALLOWED_EXTENSIONS: str = "..."`
- Not `List[str]`

#### Error: "ModuleNotFoundError: No module named 'transformers'"
```bash
# Make sure virtual environment is activated
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS

# Reinstall dependencies
pip install -r requirements.txt
```

#### CLIP Model Download Fails
```bash
# Download manually
python -c "from transformers import CLIPModel, CLIPProcessor; CLIPModel.from_pretrained('openai/clip-vit-large-patch14'); CLIPProcessor.from_pretrained('openai/clip-vit-large-patch14')"
```

#### Error: "Gemini API error"
- Check your API key is correct in `.env`
- Verify you haven't exceeded free tier limits (1,500 requests/day)
- Test API key: Visit https://aistudio.google.com/app/apikey

### Frontend Issues

#### Port 3000 already in use
```bash
# Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS:
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.js
```

#### "Failed to fetch" when uploading images
- Make sure backend is running on port 8000
- Check CORS_ORIGINS in backend `.env` includes `http://localhost:3000`
- Check browser console for detailed error

#### Images not displaying
- Backend must be serving static files
- Check uploads directory exists: `./uploads/`
- Verify image paths in browser network tab

---

## Development Workflow

### Making Changes

**Backend changes**:
1. Edit Python files in `backend/app/`
2. Uvicorn will auto-reload (if using `--reload`)
3. Refresh browser to see changes

**Frontend changes**:
1. Edit files in `frontend/src/`
2. Vite will hot-reload automatically
3. Changes appear instantly in browser

### Database Changes

**View database**:
```bash
psql -U imageapp -d imagedb

# Useful commands:
\dt              # List tables
\d images        # Describe images table
SELECT * FROM images;
SELECT * FROM image_tags;
```

**Reset database**:
```bash
# Drop and recreate
psql -U postgres
DROP DATABASE imagedb;
CREATE DATABASE imagedb;
GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
\c imagedb
CREATE EXTENSION vector;
\q

# Tables will be created automatically on next backend start
```

### View Logs

**Backend logs**:
- Visible in terminal where uvicorn is running
- Add print statements for debugging

**Frontend logs**:
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

---

## IDE Setup

### VS Code (Recommended)

1. **Install extensions**:
   - Python
   - Pylance
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense

2. **Open workspace**:
   - File > Open Folder > Select `Archive` directory

3. **Python interpreter**:
   - Ctrl+Shift+P > "Python: Select Interpreter"
   - Choose the venv: `./backend/venv/Scripts/python.exe`

4. **Settings** (.vscode/settings.json):
   ```json
   {
     "python.defaultInterpreterPath": "./backend/venv/Scripts/python.exe",
     "python.linting.enabled": true,
     "editor.formatOnSave": true,
     "tailwindCSS.experimental.classRegex": [
       ["cn\\(([^)]*)\\)", "'([^']*)'"]
     ]
   }
   ```

---

## Stopping Services

### Backend
- Press `Ctrl+C` in the terminal running uvicorn
- Deactivate venv: `deactivate`

### Frontend
- Press `Ctrl+C` in the terminal running npm

### Database
```bash
# Windows: Stop in services.msc

# Linux:
sudo systemctl stop postgresql

# macOS:
brew services stop postgresql@16
```

---

## Next Steps

Once everything works locally:

1. **Customize the theme**:
   - Edit `frontend/src/index.css` for colors
   - Modify `frontend/tailwind.config.js` for design tokens

2. **Add more features**:
   - Image editing with Konva
   - Semantic search with pgvector
   - Image versioning

3. **Deploy to production**:
   - Use Docker Compose (see [README.md](README.md))
   - Deploy to Coolify

---

## Performance Notes

### First Run
- **Backend**: 5-10 min (downloading CLIP model ~1.5GB)
- **Frontend**: 2-3 min (npm install)

### Subsequent Runs
- **Backend**: Instant (models cached)
- **Frontend**: Instant

### Resource Usage
- **Backend**: ~2GB RAM (CLIP model loaded)
- **Frontend**: ~200MB RAM
- **Database**: ~100MB RAM
- **Total**: ~2.5GB RAM minimum

---

## Getting Help

1. Check error messages in terminal
2. Review this guide's troubleshooting section
3. Check API docs: http://localhost:8000/docs
4. Verify all environment variables in `.env`
5. Check PostgreSQL connection with `psql`

---

**You're all set!** Start developing your AI image archive platform. 🚀
