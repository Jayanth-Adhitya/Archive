# Quick Start Guide

Get your AI Image Archive running in 5 minutes!

## Prerequisites

1. **Docker Desktop** installed and running
2. **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Setup Steps

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Create environment file**
   ```bash
   copy .env.example .env     # Windows
   cp .env.example .env       # Linux/Mac
   ```

2. **Edit `.env` file and add your keys:**
   ```env
   DB_PASSWORD=your_secure_password_123
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_random_secret_key_here
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Wait for services to start** (~2-3 minutes for first time)
   ```bash
   docker-compose logs -f
   ```

5. **Access the application**
   - Open browser to: http://localhost

## First Time Usage

1. **Create Account**
   - Click "Register"
   - Enter email and password
   - You'll be automatically logged in

2. **Upload First Image**
   - Drag and drop an image to the upload area
   - Wait for AI tagging to complete
   - Your image appears in the gallery with auto-generated tags

3. **Try Search**
   - Type a tag in the search bar (e.g., "person", "outdoor")
   - See matching images instantly

4. **Use AI Assistant**
   - Click "AI Assistant" in the header
   - Ask: "What images do I have?"
   - Get intelligent responses about your archive

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build

# Remove everything (including data!)
docker-compose down -v
```

## Troubleshooting

### Can't access http://localhost
- Check Docker is running: `docker ps`
- Check logs: `docker-compose logs frontend`
- Try: http://127.0.0.1

### Images not uploading
- Check backend logs: `docker-compose logs backend`
- Verify Gemini API key is correct in .env
- Ensure CLIP model downloaded successfully

### AI Assistant not responding
- Verify Gemini API key in .env
- Check you haven't exceeded free tier limits (1,500 req/day)
- Check backend logs for errors

### Database connection errors
- Stop and restart: `docker-compose down && docker-compose up -d`
- Check PostgreSQL: `docker-compose logs postgres`

## What's Next?

- **Upload more images** to build your archive
- **Try different searches** to test the AI tagging
- **Ask the AI assistant** to help you find specific photos
- **Request task assistance** for projects like newsletters
- **Customize the theme** by editing frontend/src/index.css

## API Documentation

Interactive API docs available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Getting Help

1. Check [README.md](README.md) for detailed documentation
2. Review troubleshooting section above
3. Check Docker logs for error messages
4. Verify environment variables in .env

## Deployment to Production

See [README.md](README.md#deployment-to-coolify) for Coolify deployment instructions.

---

Enjoy your AI-powered image archive! 🚀
