#!/bin/bash

# Darji Pro - Development Setup Script

echo "🚀 Setting up Darji Pro Development Environment..."

# Check Python version
echo "📌 Checking Python version..."
python --version

if [ $? -ne 0 ]; then
    echo "❌ Python is not installed. Please install Python 3.11+"
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
cd backend
python -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
echo "⚙️ Setting up environment variables..."
if [ ! -f ../.env ]; then
    cp ../.env.example ../.env
    echo "✅ Created .env file. Please update with your configuration."
else
    echo "ℹ️ .env file already exists"
fi

# Database setup instructions
echo ""
echo "📊 Database Setup:"
echo "1. Make sure PostgreSQL is running"
echo "2. Create database: createdb darji_pro"
echo "3. Run migrations: alembic upgrade head"
echo ""

# Redis setup instructions
echo "🔴 Redis Setup:"
echo "Make sure Redis is running on localhost:6379"
echo ""

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update .env with your configuration"
echo "2. Start PostgreSQL and Redis"
echo "3. Run: alembic upgrade head"
echo "4. Run: uvicorn app.main:app --reload"
echo ""
echo "📚 Documentation: http://localhost:8000/docs"
