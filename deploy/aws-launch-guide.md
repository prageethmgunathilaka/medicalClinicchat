# 🚀 AWS EC2 Launch Guide - Medical Clinic Chat

## Step-by-Step AWS Console Instructions

### 1. 🖥️ Launch EC2 Instance

**In your AWS Console (you should be on the Launch Instance page):**

#### **Name and Tags Section:**
- **Name**: `medical-clinic-chat`
- **Additional tags** (optional): Add `Project: Medical Clinic Chat`

#### **Application and OS Images (AMI):**
- ✅ Select **"Amazon Linux 2 AMI (HVM) - Kernel 5.10, SSD Volume Type"**
- ✅ Should show **"Free tier eligible"** 
- Architecture: 64-bit (x86)

#### **Instance Type:**
- ✅ Select **`t2.micro`** 
- ✅ Should show **"Free tier eligible"**
- 1 vCPU, 1 GiB Memory

#### **Key Pair (login):**
**Option A - Create New Key Pair:**
1. Click **"Create new key pair"**
2. **Key pair name**: `medical-clinic-chat-key`
3. **Key pair type**: RSA
4. **Private key file format**: .pem
5. Click **"Create key pair"**
6. **⚠️ IMPORTANT**: Download will start automatically - **SAVE THIS FILE SECURELY!**

**Option B - Use Existing Key Pair:**
- Select your existing key pair from dropdown

#### **Network Settings (CRITICAL SECTION):**
Click **"Edit"** next to Network settings:

**Security Group Settings:**
- **Create security group** (recommended)
- **Security group name**: `medical-clinic-chat-sg`
- **Description**: `Security group for Medical Clinic Chat application`

**Security Group Rules:**
1. **SSH Rule** (already present):
   - Type: SSH
   - Port: 22
   - Source: My IP (recommended) or 0.0.0.0/0

2. **Add HTTP Rule**:
   - Click "Add security group rule"
   - Type: HTTP
   - Port: 80
   - Source: 0.0.0.0/0

3. **Add HTTPS Rule**:
   - Click "Add security group rule"
   - Type: HTTPS
   - Port: 443
   - Source: 0.0.0.0/0

4. **Add Custom TCP Rule for Backend**:
   - Click "Add security group rule"
   - Type: Custom TCP
   - Port: 4000
   - Source: 0.0.0.0/0
   - Description: Backend API (temporary)

#### **Configure Storage:**
- **Volume Type**: gp3 (General Purpose SSD)
- **Size**: 8 GiB (Free tier eligible)
- **Encrypted**: No (to stay in free tier)

#### **Advanced Details:**
- Leave all as defaults (for simplicity)

### 2. 🚀 Launch the Instance

1. **Review Summary Panel** on the right side
2. **Number of instances**: 1
3. Click **"Launch instance"** (orange button)

### 3. ✅ Verify Launch

1. You should see: **"Successfully initiated launch of instance i-xxxxxxxxx"**
2. Click **"View all instances"**
3. Wait for:
   - **Instance State**: Running
   - **Status Checks**: 2/2 checks passed (may take 2-3 minutes)

### 4. 📝 Note Important Information

Once your instance is running, note:
- **Instance ID**: `i-xxxxxxxxx`
- **Public IPv4 address**: `x.x.x.x` (this is what you'll use)
- **Public IPv4 DNS**: `ec2-x-x-x-x.compute-1.amazonaws.com`

---

## 🔑 Connect to Your Instance

### Windows (PowerShell):
```powershell
# Navigate to where you saved the .pem file
ssh -i "medical-clinic-chat-key.pem" ec2-user@YOUR-PUBLIC-IP
```

### macOS/Linux:
```bash
# Set permissions (first time only)
chmod 400 medical-clinic-chat-key.pem

# Connect
ssh -i "medical-clinic-chat-key.pem" ec2-user@YOUR-PUBLIC-IP
```

---

## 🛠️ Next Steps After Connecting

1. **Run Server Setup**: `sudo ./setup-server.sh`
2. **Clone Repository**: `git clone https://github.com/prageethmgunathilaka/medicalClinicchat.git`
3. **Deploy Application**: `./deploy/deploy.sh`
4. **Add OpenAI API Key**: Edit `backend/.env`
5. **Access Your App**: `http://YOUR-PUBLIC-IP`

---

## 🆘 Troubleshooting

### Can't Connect via SSH:
1. Check Security Group allows SSH from your IP
2. Verify you're using the correct .pem file
3. Ensure instance is in "running" state

### Instance Won't Start:
1. Check if you've exceeded free tier limits
2. Try a different availability zone
3. Verify your AWS account has proper permissions

### App Not Loading:
1. Check Security Group allows HTTP (port 80)
2. Verify deployment completed successfully
3. Check application logs: `pm2 logs`

---

## 💰 Cost Monitoring

- **t2.micro**: Free for 750 hours/month
- **8 GB storage**: Free for 30 GB/month
- **Data transfer**: 15 GB outbound free/month

Monitor usage in AWS Billing Dashboard! 