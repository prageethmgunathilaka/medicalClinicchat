#!/bin/bash

# 🔧 Medical Clinic Chat - CI/CD Setup Script
# Run this ONCE on your EC2 instance to prepare for automated deployments

set -e

echo "🔧 Setting up EC2 instance for CI/CD deployments..."
echo "⏰ This will take about 5-10 minutes..."

# Check if running as ec2-user
if [ "$USER" != "ec2-user" ]; then
    echo "❌ Please run this script as ec2-user!"
    echo "Usage: ./ci-cd-setup.sh"
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
sudo chown -R nginx:nginx /var/www/medical-clinic-chat

# Clone repository for initial setup
print_status "Cloning repository for initial setup"
if [ -d "medical-clinic-chat" ]; then
    echo "📁 Repository already exists"
else
    git clone https://github.com/prageethmgunathilaka/medicalClinicchat.git medical-clinic-chat
fi

cd medical-clinic-chat

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

# Create environment file template
print_status "Setting up environment variables"
if [ ! -f "backend/.env" ]; then
    echo "NODE_ENV=production" > backend/.env
    echo "PORT=4000" >> backend/.env
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> backend/.env
    echo "📝 Environment file created"
fi

# Set up PM2 for automatic startup
print_status "Configuring PM2 for automatic startup"
pm2 startup systemd -u ec2-user --hp /home/ec2-user | tail -n 1 | sudo bash || echo "PM2 startup already configured"

# Start and enable Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Set up proper permissions for CI/CD
print_status "Setting up permissions for CI/CD"
# Allow ec2-user to manage web files
sudo usermod -a -G nginx ec2-user
# Set up sudo permissions for nginx operations (for CI/CD)
echo "ec2-user ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx, /bin/systemctl restart nginx, /bin/rm -rf /var/www/medical-clinic-chat/*, /bin/cp -r * /var/www/medical-clinic-chat/, /bin/chown -R nginx:nginx /var/www/medical-clinic-chat" | sudo tee /etc/sudoers.d/ec2-user-nginx

# Get public IP
public_ip=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

print_status "CI/CD Setup Complete! 🎉"

echo ""
echo "🔧 Your EC2 instance is now ready for CI/CD deployments!"
echo ""
echo "📋 What was set up:"
echo "   ✅ Node.js 18, PM2, Nginx installed"
echo "   ✅ Application directories created"
echo "   ✅ Nginx configured and running"
echo "   ✅ PM2 configured for auto-startup"
echo "   ✅ Permissions set for automated deployments"
echo ""
echo "🔑 Next Steps - Configure GitHub Secrets:"
echo "   1. Go to your GitHub repository settings"
echo "   2. Navigate to Secrets and variables → Actions"
echo "   3. Add these repository secrets:"
echo ""
echo "   EC2_HOST: $public_ip"
echo "   EC2_USER: ec2-user"
echo "   EC2_SSH_KEY: [Your private key content from medical-clinic-chat-key.pem]"
echo "   OPENAI_API_KEY: [Your OpenAI API key]"
echo ""
echo "🚀 After adding secrets, push to main branch to trigger deployment!"
echo ""
echo "📊 Your app will be live at: http://$public_ip"
echo ""
echo "✅ CI/CD setup completed successfully!" 