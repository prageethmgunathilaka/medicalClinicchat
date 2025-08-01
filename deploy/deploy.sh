#!/bin/bash

# Medical Clinic Chat - Application Deployment Script
# Run this script as ec2-user in the application directory

set -e

echo "🔧 Deploying Medical Clinic Chat Application..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the applications
echo "🏗️ Building applications..."
npm run build

# Copy frontend build to web directory
echo "📁 Copying frontend build to web directory..."
sudo rm -rf /var/www/medical-clinic-chat/*
sudo cp -r frontend/dist/* /var/www/medical-clinic-chat/
sudo chown -R nginx:nginx /var/www/medical-clinic-chat

# Set up environment variables
echo "🔧 Setting up environment variables..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Creating backend/.env file..."
    echo "NODE_ENV=production" > backend/.env
    echo "PORT=4000" >> backend/.env
    echo "OPENAI_API_KEY=" >> backend/.env
    echo "📝 Please edit backend/.env and add your OpenAI API key"
fi

# Copy PM2 ecosystem file
echo "📋 Setting up PM2 configuration..."
cp deploy/ecosystem.config.js .

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo cp deploy/nginx.conf /etc/nginx/conf.d/medical-clinic-chat.conf
sudo nginx -t

# Start/restart services
echo "🚀 Starting services..."

# Stop existing PM2 processes
pm2 delete medical-clinic-chat-backend 2>/dev/null || true

# Start backend with PM2
pm2 start ecosystem.config.js

# Start/restart Nginx  
sudo systemctl enable nginx
sudo systemctl restart nginx

# Enable PM2 startup
pm2 save
pm2 startup | tail -n 1 | sudo bash

echo "✅ Deployment complete!"
echo ""
echo "📋 Application Status:"
pm2 status
echo ""
echo "🌐 Your application should be accessible at:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "⚠️  Important: Make sure to:"
echo "1. Add your OpenAI API key to backend/.env"
echo "2. Configure your AWS Security Group to allow HTTP (port 80)"
echo "3. Update DNS if you have a domain name" 