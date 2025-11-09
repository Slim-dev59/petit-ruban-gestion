#!/bin/bash


set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check environment
echo -e "${YELLOW}📋 Checking environment...${NC}"

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Environment variables OK${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# Build
echo -e "${YELLOW}🏗️  Building...${NC}"
npm run build

# Check health
echo -e "${YELLOW}🔗 Starting health check...${NC}"
npm run start &
PID=$!
sleep 3

HEALTH=$(curl -s http://localhost:3000/api/health | grep -o '"status":"healthy"')

if [ -z "$HEALTH" ]; then
  echo -e "${RED}❌ Health check failed${NC}"
  kill $PID
  exit 1
fi

kill $PID

echo -e "${GREEN}✅ Health check passed${NC}"
echo -e "${GREEN}🎉 Deployment successful!${NC}"
