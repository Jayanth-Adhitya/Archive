# PostgreSQL Setup Guide

## Current Error
```
password authentication failed for user "imageapp"
```

This means PostgreSQL is running, but the user/password don't match what's in your `.env` file.

---

## Quick Fix - Option 1: Use Existing Password

If you already created the `imageapp` user with a password, just update your `.env` file:

1. Open `.env` file in the project root
2. Update lines 2 and 4 with your actual PostgreSQL password:
   ```env
   DATABASE_URL=postgresql://imageapp:YOUR_ACTUAL_PASSWORD@localhost:5432/imagedb
   DB_PASSWORD=YOUR_ACTUAL_PASSWORD
   ```

---

## Option 2: Reset PostgreSQL User (Recommended)

### Step 1: Connect to PostgreSQL as Admin

Open **Command Prompt** and run:

```cmd
psql -U postgres
```

If you get "password authentication failed", you need the postgres user password (set during installation).

**Can't remember postgres password?** See "Reset Postgres Password" section at the bottom.

### Step 2: Drop and Recreate Everything

Once connected to `psql`, run these commands:

```sql
-- Drop existing database and user (if they exist)
DROP DATABASE IF EXISTS imagedb;
DROP USER IF EXISTS imageapp;

-- Create new user with a password you choose
CREATE USER imageapp WITH PASSWORD 'changeme123';

-- Create database
CREATE DATABASE imagedb;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;

-- Connect to the new database
\c imagedb

-- Install pgvector extension
CREATE EXTENSION vector;

-- Grant schema privileges (important!)
GRANT ALL ON SCHEMA public TO imageapp;

-- Exit psql
\q
```

### Step 3: Update .env File

Edit your `.env` file and use the password you just set:

```env
DATABASE_URL=postgresql://imageapp:changeme123@localhost:5432/imagedb
DB_PASSWORD=changeme123
```

(Or use whatever password you chose instead of `changeme123`)

### Step 4: Test Connection

```cmd
psql -U imageapp -d imagedb
```

If this works without errors, you're good! Type `\q` to exit.

### Step 5: Start Backend

```cmd
start-backend.bat
```

---

## Option 3: Use Default PostgreSQL User (Quick Test)

For quick testing, you can use the `postgres` superuser:

1. Update `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/imagedb
   ```

2. Create just the database:
   ```cmd
   psql -U postgres
   ```
   ```sql
   CREATE DATABASE imagedb;
   \c imagedb
   CREATE EXTENSION vector;
   \q
   ```

3. Start backend

**Note**: This is not recommended for production, only for testing.

---

## Troubleshooting

### PostgreSQL Service Not Running

**Windows:**
1. Press `Win + R`
2. Type `services.msc`
3. Find `postgresql-x64-16` (or similar)
4. Right-click → Start

Or via Command Prompt (as Administrator):
```cmd
net start postgresql-x64-16
```

### Can't Connect to psql at All

**Error**: `psql: command not found`

**Fix**: Add PostgreSQL to PATH:
1. Find PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\16\bin`)
2. Add to System PATH environment variable
3. Restart Command Prompt

Or use full path:
```cmd
"C:\Program Files\PostgreSQL\16\bin\psql" -U postgres
```

### Reset Postgres Password

If you forgot the `postgres` user password:

1. Find `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\16\data\`)

2. **Backup the file first!**

3. Edit `pg_hba.conf` and temporarily change this line:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
   To:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   ```

4. Restart PostgreSQL service:
   ```cmd
   net stop postgresql-x64-16
   net start postgresql-x64-16
   ```

5. Connect without password:
   ```cmd
   psql -U postgres
   ```

6. Change password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_password';
   \q
   ```

7. **Revert `pg_hba.conf` back to `scram-sha-256`**

8. Restart PostgreSQL again

---

## Verification Checklist

After setup, verify everything works:

- [ ] PostgreSQL service is running
- [ ] Can connect: `psql -U imageapp -d imagedb`
- [ ] pgvector installed: Run in psql: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- [ ] Backend connects successfully (no password errors)

---

## Database Structure

After successful connection, the backend will automatically create these tables:
- `users` - User accounts
- `images` - Image metadata
- `image_tags` - Auto-generated tags
- `image_versions` - Edit history

You can verify with:
```cmd
psql -U imageapp -d imagedb -c "\dt"
```

---

## Common Connection Strings

**Local development** (what you need):
```
postgresql://imageapp:changeme123@localhost:5432/imagedb
```

**Using postgres superuser**:
```
postgresql://postgres:your_password@localhost:5432/imagedb
```

**Different port** (if not using default 5432):
```
postgresql://imageapp:changeme123@localhost:5433/imagedb
```

---

## Quick Start Recap

```cmd
# 1. Connect to PostgreSQL
psql -U postgres

# 2. Run setup commands
DROP DATABASE IF EXISTS imagedb;
DROP USER IF EXISTS imageapp;
CREATE USER imageapp WITH PASSWORD 'changeme123';
CREATE DATABASE imagedb;
GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;
\c imagedb
CREATE EXTENSION vector;
GRANT ALL ON SCHEMA public TO imageapp;
\q

# 3. Update .env file with the password

# 4. Test connection
psql -U imageapp -d imagedb

# 5. Start backend
start-backend.bat
```

---

Once PostgreSQL is set up correctly, the backend should start without errors! 🚀
