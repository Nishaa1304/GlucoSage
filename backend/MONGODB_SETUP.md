# 🍃 MongoDB Setup Guide

You need a MongoDB database to run the backend. Here are your options:

---

## ✅ OPTION 1: MongoDB Atlas (Cloud - FREE & RECOMMENDED)

**Takes 5 minutes, completely free, no installation needed!**

### Step-by-Step:

1. **Go to MongoDB Atlas:**
   ```
   https://cloud.mongodb.com/
   ```

2. **Sign Up (Free):**
   - Click "Try Free"
   - Sign up with Google/Email
   - Choose "Free Tier" (M0)

3. **Create a Cluster:**
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select closest region (e.g., Mumbai, Singapore)
   - Click "Create"

4. **Create Database User:**
   - Username: `glucosage`
   - Password: `GlucoSage2025` (or your choice)
   - Click "Create User"

5. **Whitelist Your IP:**
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your current IP
   - Click "Confirm"

6. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Should look like:
   ```
   mongodb+srv://glucosage:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

7. **Update .env File:**
   - Open `backend/.env`
   - Replace `<password>` with your actual password
   - Add `/glucosage` before the `?` to specify database name:
   ```
   MONGODB_URI=mongodb+srv://glucosage:GlucoSage2025@cluster0.xxxxx.mongodb.net/glucosage?retryWrites=true&w=majority
   ```

8. **Done!** Now run:
   ```bash
   npm run seed:abha
   ```

---

## 🖥️ OPTION 2: Install MongoDB Locally

**If you prefer local installation:**

### Windows:

1. **Download MongoDB:**
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service
   - Install MongoDB Compass (optional GUI)

3. **Verify Installation:**
   ```bash
   mongod --version
   ```

4. **Update .env:**
   ```
   MONGODB_URI=mongodb://localhost:27017/glucosage
   ```

5. **Start MongoDB Service:**
   ```bash
   net start MongoDB
   ```

6. **Run Seed:**
   ```bash
   npm run seed:abha
   ```

---

## 🎯 Quick Test

After setting up MongoDB, test the connection:

```bash
cd d:\Yukti\glucosage\backend
npm run seed:abha
```

You should see:
```
╔═══════════════════════════════════════════════════╗
║        🏥 ABHA Users Seeding Script              ║
╚═══════════════════════════════════════════════════╝

📡 Connecting to MongoDB...
✅ MongoDB Connected Successfully!
```

---

## 🆘 Troubleshooting

**Error: "ECONNREFUSED"**
- MongoDB is not running or connection string is wrong
- Double-check your MongoDB Atlas connection string
- Make sure you whitelisted your IP
- Verify password has no special characters (use alphanumeric)

**Error: "Authentication failed"**
- Wrong username/password in connection string
- Make sure you created the database user in Atlas

**Error: "Server selection timeout"**
- Check your internet connection
- Verify IP whitelist in Atlas
- Try "Allow Access from Anywhere" in Atlas

---

## 💡 Recommendation

**Use MongoDB Atlas (Option 1)** - It's:
- ✅ Free forever (M0 tier)
- ✅ No installation needed
- ✅ Works from anywhere
- ✅ Automatic backups
- ✅ Better for deployment later

---

**Need help?** Follow Option 1 step-by-step and you'll be ready in 5 minutes! 🚀
