# 🚀 Quick Start Guide - SplitWise Mobile App

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Smartphone with Expo Go app installed

## Installation Steps

### 1️⃣ Navigate to mobile app directory
```bash
cd mobile-app
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure Supabase

**Option A: Using Web App Credentials (Recommended)**

If you already have the web app running, you can find your Supabase credentials in:
```
src/lib/supabase.js
```

Copy the `SUPABASE_URL` and `SUPABASE_ANON_KEY` from there.

**Option B: From Supabase Dashboard**

1. Go to [supabase.com](https://supabase.com) and login
2. Open your project
3. Click **Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** (under "Project URL")
   - **Anon public** key (under "Project API keys")

**Update Configuration:**

Open `mobile-app/src/config/supabase.js` and replace:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

With your actual credentials:

```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 4️⃣ Start Expo development server
```bash
npm start
```

### 5️⃣ Run on your device

**Install Expo Go:**
- Android: [Download from Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)

**Connect:**
1. Scan the QR code shown in terminal
2. Expo Go will open and load your app

---

## 🎯 Quick Test

Once the app loads:

1. **Login Screen** will appear
2. Enter credentials:
   - Username: `admin`
   - Password: `SoulixGroup@2025`
3. Click **Login**
4. You should see the **Dashboard** with 4 tabs at the bottom

---

## 🧪 Testing Features

### Add a Member
1. Tap **Members** tab (👥 icon)
2. Tap **+** button (bottom right)
3. Enter name: "John"
4. Tap **Add Member**

### Add an Expense
1. Tap **Dashboard** tab
2. Tap **+ Add Expense** button
3. Fill in:
   - Description: "Lunch"
   - Amount: 500
   - Category: Food
   - Paid By: Select a member
   - Split Among: Select members (tap to toggle)
4. Tap **Add Expense**

### View Settlements
1. Tap **Settlements** tab (💳 icon)
2. See who owes whom
3. Tap any card to expand details

### Record a Payment
1. Tap **Dashboard** tab
2. Tap **Record Payment** button
3. Select From/To members
4. Enter amount
5. Tap **Record Payment**

---

## 📱 Alternative Run Methods

### Run on Android Emulator
```bash
npm run android
```
*Requires Android Studio and AVD setup*

### Run on iOS Simulator (Mac only)
```bash
npm run ios
```
*Requires Xcode installed*

### Run in Web Browser
```bash
npm run web
```
*Opens in browser at http://localhost:19006*

---

## 🐛 Troubleshooting

### "Metro Bundler failed to start"
```bash
# Clear cache and restart
npx expo start -c
```

### "Cannot connect to Metro"
- Make sure your phone and computer are on the **same WiFi**
- Try running with tunnel mode:
```bash
npx expo start --tunnel
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Supabase errors
- Double-check URL and key in `src/config/supabase.js`
- Ensure you copied the complete key (it's very long)
- Make sure RLS policies are enabled in Supabase

### App crashes on login
- Check Supabase credentials are correct
- Verify `admin_users` table exists in Supabase
- Check network connection

---

## 📚 Next Steps

1. **Explore all features** - Try adding expenses, members, payments
2. **Check settlements** - See how balances are calculated
3. **Test on different devices** - iOS, Android compatibility
4. **Customize** - Modify colors, add features as needed

---

## 🎨 Customization

### Change Color Scheme

Edit colors in screen files (look for hex colors):
- Primary Purple: `#667eea`
- Secondary Purple: `#764ba2`
- Success Green: `#10b981`
- Error Red: `#ef4444`

### Add/Remove Categories

Edit categories in `AddExpenseScreen.js` and `ExpensesScreen.js`:
```javascript
const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'];
```

---

## 📞 Support

If you encounter any issues:
1. Check the **Troubleshooting** section above
2. Review error messages in Expo console
3. Verify Supabase configuration
4. Check database RLS policies

---

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase configured in `src/config/supabase.js`
- [ ] Expo development server running (`npm start`)
- [ ] Expo Go app installed on phone
- [ ] App loads successfully
- [ ] Login works with admin credentials
- [ ] Dashboard displays correctly
- [ ] Can add expenses, members, payments

---

**Ready to go! 🎉** Enjoy using SplitWise Mobile!
