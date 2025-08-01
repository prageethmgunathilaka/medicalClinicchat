# 🚀 CI/CD Deployment Instructions

## Overview
Automated deployment to AWS EC2 using GitHub Actions. Every push to `main` branch automatically deploys your Medical Clinic Chat application.

## 📋 Prerequisites

- ✅ EC2 instance running (`i-0c3748c0c992b516a` - IP: `3.88.26.16`)
- ✅ SSH key pair (`medical-clinic-chat-key.pem`)
- ✅ OpenAI API key
- ✅ GitHub repository

## 🔧 One-Time Setup

### Step 1: Prepare EC2 Instance

**SSH into your EC2 instance:**
```bash
ssh -i "medical-clinic-chat-key.pem" ec2-user@3.88.26.16
```

**Run the CI/CD setup script:**
```bash
export OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
curl -o ci-cd-setup.sh https://raw.githubusercontent.com/prageethmgunathilaka/medicalClinicchat/main/deploy/ci-cd-setup.sh && chmod +x ci-cd-setup.sh && ./ci-cd-setup.sh
```

### Step 2: Configure GitHub Secrets

**In your GitHub repository:**

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add these:

#### Required Secrets:

| Secret Name | Value | Description |
|-------------|--------|-------------|
| `EC2_HOST` | `3.88.26.16` | Your EC2 public IP |
| `EC2_USER` | `ec2-user` | SSH username |
| `EC2_SSH_KEY` | `[Private key content]` | Content of your `.pem` file |
| `OPENAI_API_KEY` | `sk-your-key-here` | Your OpenAI API key (for testing & deployment) |

#### How to get EC2_SSH_KEY:
**Windows:**
```powershell
Get-Content "medical-clinic-chat-key.pem" | Out-String
```

**macOS/Linux:**
```bash
cat medical-clinic-chat-key.pem
```

Copy the **entire content** including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

## 🚀 How CI/CD Works

### Trigger Events:
- **Push to main branch** → Automatic deployment
- **Pull request to main** → Run tests only

### Pipeline Stages:

1. **Test Stage:**
   - ✅ Install dependencies
   - ✅ Run unit tests
   - ✅ Run integration tests
   - ✅ Run E2E tests (with OpenAI API access)
   - ✅ Build applications

2. **Deploy Stage** (main branch only):
   - ✅ SSH into EC2 instance
   - ✅ Pull latest code
   - ✅ Install dependencies
   - ✅ Build frontend and backend
   - ✅ Deploy frontend to Nginx
   - ✅ Update environment variables
   - ✅ Restart backend service
   - ✅ Reload web server

### Deployment URL:
Your app will be live at: **http://3.88.26.16**

## 📊 Monitoring Deployments

### GitHub Actions:
- Go to **Actions** tab in your repository
- View deployment logs and status
- See real-time progress

### On EC2 Instance:
```bash
# SSH into your instance
ssh -i "medical-clinic-chat-key.pem" ec2-user@3.88.26.16

# Check application status
pm2 status

# View application logs
pm2 logs medical-clinic-chat-backend

# Check web server
sudo systemctl status nginx

# View deployment logs
tail -f /var/log/cloud-init-output.log
```

## 🔄 Making Updates

### For Code Changes:
1. Make your changes locally
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "Update: your changes"
   git push origin main
   ```
3. GitHub Actions automatically deploys
4. Check your app at http://3.88.26.16

### For Configuration Changes:
- Update GitHub Secrets if needed
- Modify `.github/workflows/deploy.yml` for pipeline changes
- Update deployment scripts in `deploy/` folder

## 🛡️ Security Features

- ✅ **Secrets Management**: API keys stored securely in GitHub Secrets
- ✅ **SSH Key Authentication**: Secure EC2 access
- ✅ **Environment Isolation**: Production environment variables
- ✅ **Automated Testing**: Code quality checks before deployment

## 🆘 Troubleshooting

### Deployment Fails:
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Ensure EC2 instance is running
4. Check security group allows SSH

### SSH Connection Issues:
```bash
# Test SSH connection manually
ssh -i "medical-clinic-chat-key.pem" ec2-user@3.88.26.16

# Check if key format is correct in GitHub secrets
```

### Application Not Loading:
1. Check PM2 status: `pm2 status`
2. View logs: `pm2 logs medical-clinic-chat-backend`
3. Verify Nginx: `sudo systemctl status nginx`
4. Check security group allows HTTP (port 80)

### Environment Variables:
```bash
# On EC2, check environment file
cat /home/ec2-user/medical-clinic-chat/backend/.env

# Restart if needed
pm2 restart medical-clinic-chat-backend
```

## 📈 Benefits of This Setup

- ✅ **Zero-downtime deployments**
- ✅ **Automated testing before deploy**
- ✅ **Rollback capability**
- ✅ **Environment consistency**
- ✅ **Secure secret management**
- ✅ **Real-time deployment monitoring**

## 🎉 Success!

Once setup is complete:
1. **Push any code change** to main branch
2. **Watch GitHub Actions** run automatically  
3. **Visit http://3.88.26.16** to see your updates live!

Your Medical Clinic Chat now has professional CI/CD deployment! 🚀 