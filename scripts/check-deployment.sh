#!/bin/bash


echo "🔍 Checking deployment status..."
echo ""

# Check environment variables
echo "📋 Environment Variables:"
echo "  NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:=NOT SET}"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:10}..."
echo ""

# Check Node version
echo "⚙️  Node Version:"
node --version
echo ""

# Try to build
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed!"
  exit 1
fi

# Check health endpoint
echo ""
echo "🔗 Checking health endpoint..."
npm run start &
PID=$!
sleep 3

curl http://localhost:3000/api/health

kill $PID

echo ""
echo "✅ Deployment check complete!"
