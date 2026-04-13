#!/bin/bash
# Start Script for CinemaHub - Inicia Frontend + Backend

echo "🎬 CinemaHub Startup Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  No backend/.env found. Copying from template...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}📝 Please update backend/.env with your API keys:${NC}"
    echo "   - OPENAI_API_KEY (get from https://platform.openai.com/api-keys)"
    echo "   - EMAILJS credentials (get from https://dashboard.emailjs.com)"
fi

# Check if frontend .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env found. Creating default...${NC}"
    cat > .env << 'EOF'
VITE_SUPABASE_URL=https://hqxexgifvxfyjpkwxqsm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_aPL9opTU3BaSVRZS-rA9DQ_lKI4OQQg
VITE_BACKEND_URL=http://localhost:3001
EOF
fi

# Install dependencies if not present
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
fi

# Start both servers
echo -e "${GREEN}🚀 Starting servers...${NC}"
echo ""

# Start frontend in background
echo -e "${BLUE}Frontend starting on http://localhost:5173${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Start backend in background
echo -e "${BLUE}Backend starting on http://localhost:3001${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Both servers running!${NC}"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🤖 Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Handle Ctrl+C to kill both processes
trap "kill $FRONTEND_PID $BACKEND_PID" EXIT

# Keep script running
wait
