@echo off
REM Initialize Notion-to-TechBlog Sync project for Windows

echo 🚀 Initializing Notion-to-TechBlog Sync...

REM Check Node.js installation
where node >nul 2>nul
if errorlevel 1 (
  echo ❌ Node.js is not installed or not in PATH
  exit /b 1
)

echo ✓ Node.js found
node --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

REM Create .env if not exists
if not exist .env (
  echo.
  echo 📝 Creating .env file...
  copy .env.example .env
  echo ✓ .env created - please edit with your credentials
) else (
  echo ✓ .env already exists
)

REM Create directories
if not exist articles mkdir articles
if not exist public mkdir public
if not exist images mkdir images

echo.
echo ✅ Initialization complete!
echo.
echo Next steps:
echo 1. Edit .env with your Notion and Qiita credentials
echo 2. Run 'npm run sync:test' to test with one article
echo 3. See SETUP.md for detailed configuration
