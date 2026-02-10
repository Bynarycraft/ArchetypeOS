#!/bin/bash

# ArchetypeOS Setup Script

echo "═══════════════════════════════════════"
echo "ArchetypeOS - Setup Script"
echo "═══════════════════════════════════════"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✓ Prisma client generated"
echo ""

# Database migrations
echo "🗄️  Setting up database..."
echo "Please ensure PostgreSQL is running and DATABASE_URL is set in .env.local"
echo ""
read -p "Proceed with database setup? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate deploy
    if [ $? -ne 0 ]; then
        echo "⚠️  Migration failed. The database might not be ready yet."
        echo "You can run 'npx prisma migrate deploy' later."
    else
        echo "✓ Database migrations completed"
    fi
    
    # Seed database
    echo ""
    read -p "Seed database with test data? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma db seed
        if [ $? -eq 0 ]; then
            echo "✓ Database seeded successfully"
        else
            echo "⚠️  Database seed failed. You can run 'npx prisma db seed' later."
        fi
    fi
fi

echo ""
echo "═══════════════════════════════════════"
echo "✅ Setup complete!"
echo "═══════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Review the .env.local file and set correct DATABASE_URL"
echo "2. Start the development server: npm run dev"
echo "3. Visit http://localhost:3000"
echo ""
echo "Default Test Credentials:"
echo "  Admin:      admin@archetype.local / admin123"
echo "  Supervisor: supervisor@archetype.local / supervisor123"
echo "  Learner:    learner1@archetype.local / learner123"
echo "  Candidate:  candidate@archetype.local / candidate123"
echo ""
