#!/bin/bash

# Medical Clinic Chat - AWS EC2 Deployment Script
# Run this script on your EC2 instance as root or with sudo

set -e

echo "🚀 Setting up Medical Clinic Chat on AWS EC2..."

# Update system
echo "📦 Updating system packages..."
yum update -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
yum install -y nginx

# Install Git
echo "📦 Installing Git..."
yum install -y git

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/medical-clinic-chat
mkdir -p /home/ec2-user/medical-clinic-chat
mkdir -p /home/ec2-user/medical-clinic-chat/logs

# Set up permissions
chown -R ec2-user:ec2-user /home/ec2-user/medical-clinic-chat
chown -R nginx:nginx /var/www/medical-clinic-chat

echo "✅ Server setup complete!"
echo "📋 Next steps:"
echo "1. Clone your repository to /home/ec2-user/medical-clinic-chat"
echo "2. Set up environment variables"  
echo "3. Build and deploy the application"
echo "4. Configure Nginx and start services" 