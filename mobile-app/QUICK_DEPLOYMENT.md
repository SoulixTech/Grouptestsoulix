# 🚀 Quick Mobile App Deployment

## You Are Here: ✅ Step 1 Complete

You've successfully installed EAS CLI!

## Next Steps

### Step 2: Login to Expo

```cmd
cd mobile-app
eas login
```

**Don't have an Expo account?**
1. Go to https://expo.dev
2. Click "Sign Up"
3. Use your email or GitHub account
4. Verify your email
5. Come back and run `eas login`

---

### Step 3: Configure EAS Build

```cmd
eas build:configure
```

This will:
- Create `eas.json` configuration file
- Ask a few questions (just press Enter for defaults)
- Set up Android build profile

---

### Step 4: Build Android APK

```cmd
eas build -p android --profile preview
```

**What happens:**
- ✅ Uploads your code to Expo servers
- ✅ Builds APK in the cloud
- ✅ Takes 10-20 minutes
- ✅ Sends you download link via email
- ✅ Also available at expo.dev/builds

**During the build, you'll be asked:**
- "Generate a new Android Keystore?" → Press `Y` (yes)
- It will auto-generate everything else

---

### Step 5: Download Your APK

After build completes:

1. **Check email** - Expo sends download link
2. **OR visit** https://expo.dev/builds
3. **Download APK** - File will be named like `build-xxxxx.apk`
4. **Rename it** - To something like `splitwise-mobile-v1.0.0.apk`

---

### Step 6: Host the APK

**Option A: Netlify (Easiest)**

1. Go to https://netlify.com
2. Sign up (free)
3. Click "Add new site" → "Deploy manually"
4. Create a folder on your desktop with:
   - `index.html` (copy from `mobile-app/download.html`)
   - `splitwise-mobile-v1.0.0.apk` (your built APK)
5. Drag folder to Netlify
6. Get URL like: `your-app.netlify.app`

**Option B: Vercel**

Similar to Netlify, use https://vercel.com

---

## 📋 Complete Command Sequence

Copy and run these commands one by one:

```cmd
# Navigate to mobile app folder
cd G:\paytestv1\mobile-app

# Login to Expo (you'll need account)
eas login

# Configure EAS build
eas build:configure

# Build APK (takes 10-20 minutes)
eas build -p android --profile preview

# Check build status
eas build:list
```

---

## ⏱️ Timeline

- **Step 2** (Login): 2 minutes
- **Step 3** (Configure): 1 minute
- **Step 4** (Build): 10-20 minutes ⏳
- **Step 5** (Download): 2 minutes
- **Step 6** (Host): 5 minutes

**Total: ~30 minutes**

---

## 🎯 Current Status

✅ EAS CLI installed
⏳ Ready for Step 2: Login to Expo

**Next command to run:**
```cmd
cd mobile-app
eas login
```

---

## 🆘 Troubleshooting

### "eas: command not found"
Close and reopen terminal, then try again.

### "No Expo account"
1. Go to https://expo.dev/signup
2. Create free account
3. Verify email
4. Run `eas login` again

### "Build failed"
1. Check expo.dev/builds for error logs
2. Common issues:
   - Missing dependencies → Run `npm install` in mobile-app folder
   - Invalid app.json → Check JSON syntax
   - Network timeout → Try again

---

## 📱 What You'll Get

After completing all steps:

1. **APK file** - Android app installer
2. **Download page** - Beautiful landing page for users
3. **Hosted URL** - Share link with anyone
4. **Real-time sync** - Works with your web app instantly

---

## 🎉 After Deployment

Users can:
1. Visit your download page URL
2. Click "Download APK"
3. Install on Android phone
4. Login with: admin / SoulixGroup@2025
5. Start using the app!

**Both web and mobile sync automatically** ✨

---

**Ready? Run this now:**
```cmd
cd mobile-app
eas login
```
