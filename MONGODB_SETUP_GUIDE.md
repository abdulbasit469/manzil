# MongoDB Setup Guide for MANZIL Project

## Understanding Your Setup

Your project uses **MongoDB Atlas** (cloud database), NOT a local MongoDB server. This means:
- ✅ **No need to install or start MongoDB locally**
- ✅ **Database is hosted in the cloud**
- ✅ **You just need a connection string**

## Step 1: Get MongoDB Atlas Connection String

### Option A: If you already have MongoDB Atlas account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Login to your account
3. Click on your cluster
4. Click **"Connect"** button
5. Choose **"Connect your application"**
6. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
7. Replace `<password>` with your actual database password
8. Replace `<dbname>` with your database name (e.g., `manzil`)

### Option B: Create a new MongoDB Atlas account (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Create a free cluster (M0 - Free tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
5. Whitelist your IP:
   - Go to "Network Access" → "Add IP Address"
   - Click "Add Current IP Address" or use `0.0.0.0/0` for all IPs (less secure)
6. Get connection string:
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name

## Step 2: Create .env File

Create a file named `.env` in the `backend` folder with this content:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/manzil?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Email Configuration (Optional - for OTP emails)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password
```

**Important**: Replace the values:
- `MONGODB_URI`: Your actual MongoDB Atlas connection string
- `JWT_SECRET`: A random secret string (can be anything, but keep it secret)
- Other values as needed

## Step 3: Test the Connection

1. Make sure `.env` file is in `backend` folder
2. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

3. You should see:
   ```
   🔌 Connecting to MongoDB...
   ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   📊 Database: manzil
   🚀 Manzil Server is running on port 5000
   ```

## Troubleshooting

### Error: "MONGODB_URI is not defined"
- **Solution**: Make sure `.env` file exists in `backend` folder
- **Solution**: Make sure `.env` file has `MONGODB_URI=` line

### Error: "MongoDB Connection Error"
- **Check 1**: Internet connection is working
- **Check 2**: Your IP is whitelisted in MongoDB Atlas (Network Access)
- **Check 3**: Username and password in connection string are correct
- **Check 4**: Database name is correct

### Error: "Authentication failed"
- **Solution**: Check your database username and password
- **Solution**: Make sure you replaced `<password>` in connection string

### Error: "IP not whitelisted"
- **Solution**: Go to MongoDB Atlas → Network Access → Add your current IP
- **Or**: Use `0.0.0.0/0` to allow all IPs (only for development!)

## Local MongoDB (Alternative - Not Recommended)

If you want to use local MongoDB instead:

1. **Install MongoDB Community Server**:
   - Download from: https://www.mongodb.com/try/download/community
   - Install on Windows
   - MongoDB will run as a Windows service automatically

2. **Start MongoDB** (if not running as service):
   ```bash
   mongod --dbpath "C:\data\db"
   ```

3. **Update .env**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/manzil
   ```

**Note**: MongoDB Atlas (cloud) is recommended because:
- ✅ No installation needed
- ✅ Free tier available
- ✅ Automatic backups
- ✅ Accessible from anywhere
- ✅ Better for development and production

## Quick Start Checklist

- [ ] MongoDB Atlas account created
- [ ] Database user created
- [ ] IP address whitelisted
- [ ] Connection string copied
- [ ] `.env` file created in `backend` folder
- [ ] `MONGODB_URI` added to `.env`
- [ ] Backend server started successfully
- [ ] Database connection confirmed (check console output)

