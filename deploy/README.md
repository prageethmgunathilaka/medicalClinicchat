# 🚀 AWS EC2 Deployment Guide

Deploy your Medical Clinic Chat application to AWS EC2 using the free tier.

## 📋 Prerequisites

- AWS Account with access to EC2
- OpenAI API Key
- Basic terminal/SSH knowledge

## 🏗️ Step 1: Launch EC2 Instance

### In AWS Console:

1. **Go to EC2 Dashboard** → Launch Instance

2. **Configure Instance:**
   - **Name**: `medical-clinic-chat`
   - **AMI**: Amazon Linux 2 AMI (HVM) - Free tier eligible
   - **Instance Type**: `t2.micro` (Free tier eligible)
   - **Key Pair**: Create new or select existing
   - **Storage**: 8 GB gp2 (Free tier eligible)

3. **Security Group Settings:**
   ```
   Type            Port    Source      Description
   SSH             22      Your IP     SSH access
   HTTP            80      0.0.0.0/0   Web traffic
   HTTPS           443     0.0.0.0/0   Secure web traffic  
   Custom TCP      4000    0.0.0.0/0   Backend API (temporary)
   ```

4. **Launch Instance** and wait for it to be running

## 🔧 Step 2: Connect to Your Instance

```bash
# Replace with your key file and instance IP
ssh -i "your-key.pem" ec2-user@your-instance-ip
```

## 📦 Step 3: Server Setup

### Run the server setup script:

```bash
# Download and run setup script
curl -o setup-server.sh https://raw.githubusercontent.com/prageethmgunathilaka/medicalClinicchat/main/deploy/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

## 📁 Step 4: Clone Your Repository

```bash
cd /home/ec2-user
git clone https://github.com/prageethmgunathilaka/medicalClinicchat.git medical-clinic-chat
cd medical-clinic-chat
```

## 🔧 Step 5: Deploy Application

### Run the deployment script:

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

## 🔑 Step 6: Configure Environment Variables

### Add your OpenAI API key:

```bash
nano backend/.env
```

**Add your API key:**
```env
NODE_ENV=production
PORT=4000
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### Restart the backend:

```bash
pm2 restart medical-clinic-chat-backend
```

## 🌐 Step 7: Access Your Application

Your app will be available at:
```
http://your-ec2-public-ip
```

## 📊 Monitoring & Management

### Check application status:
```bash
pm2 status
pm2 logs medical-clinic-chat-backend
```

### Check Nginx status:
```bash
sudo systemctl status nginx
sudo nginx -t
```

### View logs:
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Updates & Redeployment

### To update your application:

```bash
cd /home/ec2-user/medical-clinic-chat
git pull origin main
./deploy/deploy.sh
```

## 🛡️ Security Considerations

### For production use:

1. **Remove port 4000** from Security Group (Nginx proxies requests)
2. **Set up SSL/TLS** with Let's Encrypt
3. **Configure firewall** rules
4. **Regular security updates**

### SSL Setup (Optional):
```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 💰 Cost Optimization

### Free Tier Limits:
- **EC2**: 750 hours/month of t2.micro
- **EBS**: 30 GB of storage
- **Data Transfer**: 15 GB outbound

### Monitor usage in AWS Billing Dashboard

## 🆘 Troubleshooting

### Common Issues:

#### App not loading:
```bash
# Check PM2 status
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check logs
pm2 logs medical-clinic-chat-backend
```

#### Socket.IO connection issues:
```bash
# Verify Nginx proxy configuration
sudo nginx -t
sudo systemctl reload nginx
```

#### Build failures:
```bash
# Check Node.js version
node --version  # Should be 18+

# Clean install
rm -rf node_modules
npm install
```

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs`
2. Verify Security Group settings
3. Ensure OpenAI API key is set correctly
4. Check AWS Free Tier usage

---

## 🎉 Success!

Your Medical Clinic Chat application is now running on AWS EC2!

**URL**: `http://your-ec2-public-ip` 