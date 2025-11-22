# 🚀 Complete Deployment Guide

## Overview

This guide covers deploying both your **Web App** (Next.js) and **Mobile App** (React Native/Expo).

---

## 📱 MOBILE APP DEPLOYMENT

### Option A: Build APK with Expo EAS (Recommended)

#### Step 1: Install EAS CLI

```cmd
npm install -g eas-cli
```

#### Step 2: Create Expo Account

1. Go to [expo.dev](https://expo.dev)
2. Sign up for free account
3. Verify email

#### Step 3: Login to Expo

```cmd
cd mobile-app
eas login
```

Enter your Expo credentials.

#### Step 4: Configure EAS Build

```cmd
eas build:configure
```

This creates `eas.json` file with build configurations.

#### Step 5: Build Android APK

```cmd
eas build -p android --profile preview
```

- This uploads your code to Expo servers
- Build takes 10-20 minutes
- You'll get a download link when done

#### Step 6: Download APK

1. Check your email or visit [expo.dev/builds](https://expo.dev/builds)
2. Download the APK file (e.g., `splitwise-mobile-v1.0.0.apk`)
3. Save it to a folder

#### Step 7: Host the APK

**Option 1: Netlify (Free)**

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Drag and drop your APK + download.html
4. Get URL like: `splitwise-download.netlify.app`

**Option 2: Vercel (Free)**

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Create new project
4. Upload APK + download.html
5. Get URL like: `splitwise-download.vercel.app`

**Option 3: GitHub Releases**

1. Go to your GitHub repo
2. Click "Releases" → "Create new release"
3. Upload APK file
4. Users download directly from GitHub

---

### Option B: Expo Go (Quick Test - No APK)

**For quick testing without building APK:**

1. Install Expo Go on your phone
2. Deploy to Expo servers:
```cmd
cd mobile-app
eas update --branch production
```
3. Share the Expo link with users
4. They open it in Expo Go app

**Pros:** 
- ✅ Instant deployment
- ✅ No build time

**Cons:** 
- ❌ Users need Expo Go app
- ❌ Not a standalone app

---

## 🌐 WEB APP DEPLOYMENT

### Option 1: Vercel (Recommended for Next.js)

#### Step 1: Push to GitHub

```cmd
cd G:\paytestv1
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/soulixtech/paytestv1.git
git push -u origin main
```

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import `paytestv1` repository
5. Vercel auto-detects Next.js
6. Click "Deploy"
7. Wait 2-3 minutes
8. Get URL: `paytestv1.vercel.app`

#### Step 3: Configure Environment (if needed)

If using environment variables:
1. Go to Project Settings → Environment Variables
2. Add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy

#### Step 4: Custom Domain (Optional)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel → Settings → Domains
3. Add your domain
4. Update DNS records
5. Example: `splitwise.yourdomain.com`

---

### Option 2: Netlify

#### Step 1: Build the Project

```cmd
cd G:\paytestv1
npm run build
```

This creates a `.next` folder.

#### Step 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up
3. Drag and drop the entire project folder
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Deploy
6. Get URL: `splitwise.netlify.app`

---

## 🎯 RECOMMENDED DEPLOYMENT STRATEGY

### For Best User Experience:

```
┌─────────────────────────────────────────┐
│  Web App (Desktop/Mobile Browser)      │
│  → Deploy to Vercel                    │
│  → URL: splitwise.vercel.app           │
│  → Auto HTTPS, fast loading            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Mobile App (Native Android)           │
│  → Build APK with Expo EAS             │
│  → Host APK on Netlify/Vercel          │
│  → Create download page                │
│  → URL: splitwise-mobile.netlify.app   │
└─────────────────────────────────────────┘
```

---

## 📥 APK Download Page Setup

### Step 1: Create Download Page

I've already created `mobile-app/download.html` for you!

### Step 2: Update Links

Edit `download.html`:

```html
<!-- Line 129: Update APK filename -->
<a href="splitwise-mobile-v1.0.0.apk" class="download-btn" download>

<!-- Line 149: Update web app URL -->
Access the web app at: <a href="https://YOUR-WEB-APP.vercel.app">
```

### Step 3: Deploy Download Page

**To Netlify:**

1. Create folder: `mobile-download/`
2. Add files:
   - `download.html` (rename to `index.html`)
   - `splitwise-mobile-v1.0.0.apk`
3. Drag to Netlify
4. Get URL: `splitwise-download.netlify.app`

**To Vercel:**

Same process as Netlify.

---

## 🔧 Build Configuration for Mobile

### eas.json (Auto-created by `eas build:configure`)

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Profiles:**
- **development**: For testing with Expo Go
- **preview**: Generates APK for direct download
- **production**: Generates AAB for Google Play Store

---

## 📊 Comparison Table

| Feature | Vercel (Web) | Netlify (Web) | Expo EAS (Mobile) |
|---------|-------------|---------------|-------------------|
| **Best For** | Next.js | Static sites | React Native |
| **Build Time** | 2-3 min | 3-5 min | 10-20 min |
| **Free Tier** | ✅ Generous | ✅ Good | ✅ Limited builds/month |
| **Auto Deploy** | ✅ Yes | ✅ Yes | ⚠️ Manual trigger |
| **Custom Domain** | ✅ Free | ✅ Free | ❌ N/A |
| **HTTPS** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Rollback** | ✅ Easy | ✅ Easy | ⚠️ Manual |

---

## 🎯 Deployment Checklist

### Before Deploying Web App:
- [ ] Test locally (`npm run dev`)
- [ ] Fix all errors
- [ ] Update Supabase credentials
- [ ] Test production build (`npm run build`)
- [ ] Push to GitHub
- [ ] Connect to Vercel/Netlify
- [ ] Configure environment variables
- [ ] Test deployed URL

### Before Building Mobile APK:
- [ ] Test on Expo Go (`npm start`)
- [ ] Update Supabase credentials in `src/config/supabase.js`
- [ ] Update `app.json` with correct bundle ID
- [ ] Test all features work
- [ ] Create Expo account
- [ ] Run `eas build -p android --profile preview`
- [ ] Download APK from Expo dashboard
- [ ] Test APK on real device
- [ ] Upload to download page

---

## 🚀 Quick Deploy Commands

### Web App (Vercel)
```cmd
# One-time setup
npm install -g vercel

# Deploy
cd G:\paytestv1
vercel

# Production deploy
vercel --prod
```

### Mobile APK (Expo)
```cmd
# One-time setup
npm install -g eas-cli

# Login
cd mobile-app
eas login

# Build APK
eas build -p android --profile preview

# Check build status
eas build:list
```

---

## 📱 How Users Install APK

### Android:

1. **User visits**: `splitwise-download.netlify.app`
2. **Clicks**: "Download APK (Android)" button
3. **Opens**: Downloaded APK file
4. **Allows**: "Install from Unknown Sources" (if prompted)
5. **Taps**: "Install"
6. **Opens**: App from home screen
7. **Logs in**: With admin credentials

### Security Settings:

Users may need to enable:
- Settings → Security → Unknown Sources ✅
- Or: Settings → Apps → Special Access → Install Unknown Apps → Chrome/Browser ✅

---

## 💡 Pro Tips

### For Web App:
1. ✅ Use Vercel for Next.js (best performance)
2. ✅ Enable preview deployments for testing
3. ✅ Set up custom domain for professional look
4. ✅ Monitor analytics with Vercel Analytics

### For Mobile App:
1. ✅ Use `preview` profile for APK (not production)
2. ✅ Test APK on multiple devices before sharing
3. ✅ Consider publishing to Google Play Store later
4. ✅ Use Expo's OTA updates for quick fixes

---

## 🆘 Troubleshooting

### Web Deploy Fails:
- Check build logs in Vercel/Netlify dashboard
- Ensure `package.json` has correct scripts
- Verify Node.js version compatibility

### APK Build Fails:
- Check Expo build logs
- Ensure `app.json` is valid JSON
- Verify all dependencies are compatible
- Try `eas build:configure` again

### APK Won't Install:
- File might be corrupted (re-download)
- Android version might be too old (need Android 5.0+)
- Security settings blocking installation

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Web app accessible at: `your-app.vercel.app`
- ✅ Mobile APK downloadable at: `your-download.netlify.app`
- ✅ Both sharing same Supabase database
- ✅ Instant updates for web (auto-deploy on git push)
- ✅ Manual APK updates (rebuild when needed)

---

## 📞 Next Steps After Deployment

1. **Share Links:**
   - Web: `https://paytestv1.vercel.app`
   - Mobile: `https://splitwise-download.netlify.app`

2. **Monitor:**
   - Check Vercel analytics
   - Monitor Supabase usage
   - Review error logs

3. **Update:**
   - Push changes to GitHub → Auto-deploys to Vercel
   - Rebuild APK → Re-upload to download page

4. **Scale:**
   - Consider Google Play Store for mobile
   - Add custom domain for web
   - Set up CI/CD pipeline

---

**Deployment Complete! 🚀**
