#!/bin/bash

# 🚀 Medical Clinic Chat - One-Click Deployment Script
# Run this script on your fresh EC2 instance as ec2-user

set -e

echo "🚀 Starting Medical Clinic Chat Deployment..."
echo "⏰ This will take about 5-10 minutes..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please run this script as ec2-user, not root!"
    echo "Usage: ./quick-deploy.sh"
    exit 1
fi

# Function to print status
print_status() {
    echo ""
    echo "✅ $1"
    echo "----------------------------------------"
}

# Update system and install dependencies
print_status "Installing system dependencies"
sudo yum update -y
sudo yum install -y git

# Install Node.js 18
print_status "Installing Node.js 18"
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
echo "📦 Node.js: $node_version"
echo "📦 NPM: $npm_version"

# Install PM2 globally
print_status "Installing PM2 Process Manager"
sudo npm install -g pm2

# Install and configure Nginx
print_status "Installing and configuring Nginx"
sudo yum install -y nginx

# Create application directories
print_status "Setting up application directories"
sudo mkdir -p /var/www/medical-clinic-chat
mkdir -p /home/ec2-user/logs

# Clone the repository
print_status "Cloning Medical Clinic Chat repository"
if [ -d "medical-clinic-chat" ]; then
    echo "📁 Repository already exists, updating..."
    cd medical-clinic-chat
    git pull origin main
    cd ..
else
    git clone https://github.com/prageethmgunathilaka/medicalClinicchat.git medical-clinic-chat
fi

cd medical-clinic-chat

# Install dependencies and build
print_status "Installing dependencies and building applications"
npm install
npm run build

# Set up environment variables
print_status "Setting up environment variables"
if [ ! -f "backend/.env" ]; then
    echo "NODE_ENV=production" > backend/.env
    echo "PORT=4000" >> backend/.env
    echo "OPENAI_API_KEY=" >> backend/.env
    echo "⚠️  OpenAI API key placeholder created - you'll need to add your key!"
fi

# Copy frontend build to web directory
print_status "Deploying frontend files"
sudo rm -rf /var/www/medical-clinic-chat/*
sudo cp -r frontend/dist/* /var/www/medical-clinic-chat/
sudo chown -R nginx:nginx /var/www/medical-clinic-chat

# Configure Nginx
print_status "Configuring Nginx web server"
sudo cp deploy/nginx.conf /etc/nginx/conf.d/medical-clinic-chat.conf

# Test Nginx configuration
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration error!"
    exit 1
fi

# Start services
print_status "Starting application services"

# Stop any existing PM2 processes
pm2 delete medical-clinic-chat-backend 2>/dev/null || true

# Copy PM2 ecosystem file
cp deploy/ecosystem.config.js .

# Start backend with PM2
pm2 start ecosystem.config.js

# Configure PM2 to start on boot
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user | tail -n 1 | sudo bash

# Start and enable Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# Get public IP
public_ip=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

print_status "Deployment Complete! 🎉"

echo ""
echo "🌐 Your Medical Clinic Chat application is now live!"
echo "📍 URL: http://$public_ip"
echo ""
echo "📋 Application Status:"
pm2 status
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Add your OpenAI API key to backend/.env:"
echo "   nano backend/.env"
echo "   (Add: OPENAI_API_KEY=sk-your-actual-api-key-here)"
echo ""
echo "2. Restart the backend after adding the API key:"
echo "   pm2 restart medical-clinic-chat-backend"
echo ""
echo "3. Your app will be fully functional at: http://$public_ip"
echo ""
echo "📊 Monitoring Commands:"
echo "   pm2 status                    - Check application status"
echo "   pm2 logs                      - View application logs"
echo "   sudo systemctl status nginx   - Check web server status"
echo ""
echo "🔄 To update your app:"
echo "   cd /home/ec2-user/medical-clinic-chat"
echo "   git pull origin main"
echo "   ./deploy/deploy.sh"
echo ""
echo "✅ Deployment completed successfully!" 