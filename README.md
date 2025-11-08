# AI Image Archive Platform

An intelligent image management platform with AI-powered automatic tagging, semantic search, and conversational assistant. Built with React, FastAPI, PostgreSQL, and Gemini AI.

## Features

- **User Authentication**: Secure email/password signup and login with JWT tokens
- **Image Upload**: Drag-and-drop interface with automatic AI tagging using CLIP
- **Smart Search**: Search images by tags with full-text and semantic search capabilities
- **AI Assistant**: Conversational AI powered by Gemini 2.0 Flash that can:
  - Answer questions about your image archive
  - Help find specific photos
  - Assist with tasks like creating newsletters
  - Analyze individual images
- **Image Versioning**: Keep originals while creating edited versions
- **Modern UI**: Dark gradient theme with glassmorphism effects matching mehh.ae

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL + pgvector** - Database with vector search support
- **CLIP (OpenAI)** - Free automatic image tagging
- **Gemini 2.0 Flash** - Conversational AI and image understanding
- **Gemini 2.5 Flash Image** - AI-powered image generation and editing
- **SQLAlchemy** - ORM for database operations
- **JWT** - Secure authentication

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Dropzone** - File upload
- **Lucide React** - Beautiful icons

## Prerequisites

- Docker and Docker Compose
- Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   cd Archive
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` and add your Gemini API key**
   ```env
   DB_USER=imageapp
   DB_PASSWORD=your_secure_password_here
   DB_NAME=imagedb
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_super_secret_jwt_key_change_this
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

6. **Create your account**
   - Visit http://localhost
   - Click "Register" and create an account
   - Start uploading images!

## Development Setup (Without Docker)

### Backend Setup

1. **Install Python 3.11+**

2. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL with pgvector**
   ```bash
   # Install PostgreSQL 16
   # Then install pgvector extension
   psql -U postgres
   CREATE DATABASE imagedb;
   CREATE USER imageapp WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
   \c imagedb
   CREATE EXTENSION vector;
   ```

5. **Create `.env` file in root directory**
   ```env
   DATABASE_URL=postgresql://imageapp:your_password@localhost:5432/imagedb
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_secret_key
   ```

6. **Run the backend**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Install Node.js 18+**

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```

5. **Access at http://localhost:3000**

## Usage Guide

### Uploading Images

1. Click the upload area or drag and drop images
2. CLIP automatically tags your images
3. AI generates a description
4. Images are instantly searchable

### Searching Images

1. Use the search bar to find images by tags
2. Type keywords like "cat", "beach", "sunset"
3. Results show images with matching tags

### AI Assistant

1. Click "AI Assistant" in the header
2. Ask questions about your images:
   - "Show me all beach photos"
   - "Find images for my cat grooming newsletter"
   - "When was this photo taken?"
3. Get intelligent responses based on your archive

### Task Assistance

Example: **Creating a Newsletter**

```
You: "I want to create a newsletter for my cat grooming company"

AI: "I can help you with that! Based on your image archive, here are the best photos:
- Image ID 42: cat_grooming_session.jpg - Shows professional grooming in action
- Image ID 38: happy_cat_portrait.jpg - Perfect for showcasing results
- Image ID 51: grooming_tools.jpg - Good for explaining your process

Suggested descriptions:
1. Lead with the happy cat portrait to grab attention
2. Show the grooming process with the session photo
3. Build trust by displaying professional tools

Would you like me to help write the newsletter copy?"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Images
- `POST /api/images/upload` - Upload image with auto-tagging
- `GET /api/images/` - List user's images
- `GET /api/images/{id}` - Get specific image
- `DELETE /api/images/{id}` - Delete image
- `GET /api/images/search/tags` - Search by tags

### AI Chat
- `POST /api/chat/message` - Send message to AI
- `POST /api/chat/assist` - Get task assistance
- `POST /api/chat/analyze-image` - Analyze specific image

## Deployment to Coolify

1. **Connect your repository to Coolify**

2. **Set environment variables in Coolify UI**:
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `GEMINI_API_KEY`
   - `JWT_SECRET`

3. **Configure persistent storage**:
   - Map volume for `/app/uploads` in backend
   - Map volume for PostgreSQL data

4. **Deploy**:
   - Coolify will automatically detect docker-compose.yml
   - SSL certificates are handled automatically
   - Application will be available at your domain

## Project Structure

```
Archive/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   │   ├── auth.py       # Authentication routes
│   │   │   ├── images.py     # Image management routes
│   │   │   └── chat.py       # AI chat routes
│   │   ├── core/             # Core functionality
│   │   │   ├── config.py     # App configuration
│   │   │   ├── database.py   # Database setup
│   │   │   └── security.py   # JWT auth
│   │   ├── models/           # Database models
│   │   │   ├── user.py
│   │   │   └── image.py
│   │   ├── schemas/          # Pydantic schemas
│   │   │   ├── user.py
│   │   │   └── image.py
│   │   ├── services/         # Business logic
│   │   │   ├── clip_service.py    # CLIP tagging
│   │   │   └── gemini_service.py  # Gemini AI
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── auth/        # Auth forms
│   │   │   ├── gallery/     # Image gallery
│   │   │   └── chat/        # Chat interface
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand stores
│   │   ├── lib/             # Utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

## Future Enhancements

The following features are planned but not yet implemented:

- **Manual Image Editor**: Konva.js-based editor with brightness, contrast, crop, filters
- **AI Image Editing**: Gemini 2.5 Flash Image integration for AI-powered edits
- **Advanced Semantic Search**: Vector similarity search with pgvector
- **Image Version Control**: Complete version history with comparison
- **Batch Operations**: Upload and edit multiple images
- **Export Features**: Export images with metadata
- **Mobile App**: React Native mobile application
- **Social Sharing**: Share images and galleries

## Troubleshooting

### CLIP Model Download Issues
If CLIP fails to download during Docker build:
```bash
# Build without cache
docker-compose build --no-cache
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Recreate database
docker-compose down -v
docker-compose up -d
```

### Frontend Can't Connect to Backend
- Ensure backend is running on port 8000
- Check CORS settings in backend/app/core/config.py
- Verify nginx proxy configuration in frontend/nginx.conf

## Cost Estimate

### Free Tier Usage
- **CLIP**: Free (runs locally)
- **Gemini API**: Free tier includes 1,500 requests/day
- **PostgreSQL**: Free (self-hosted)
- **Hosting**: ~$5-20/month (VPS costs for Coolify)

### With Image Generation
- **Gemini 2.5 Flash Image**: $0.039 per image
- **Typical usage**: ~$5-15/month (100-400 generated images)

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation at http://localhost:8000/docs
3. Check backend logs: `docker-compose logs backend`
4. Check frontend logs: `docker-compose logs frontend`

## Credits

- **CLIP** - OpenAI
- **Gemini AI** - Google
- **Icons** - Lucide
- **UI Inspiration** - mehh.ae

---

Built with ❤️ using AI-powered tools
