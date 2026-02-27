#!/bin/bash
echo "🚀 PinIt Pro — Setup"
echo "===================="

# Backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created backend/.env — add your ANTHROPIC_API_KEY!"
fi

# Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start:"
echo "  Terminal 1: cd backend && npm run start:dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
