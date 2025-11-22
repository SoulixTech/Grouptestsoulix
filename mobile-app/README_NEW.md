# SplitWise Mobile App

React Native mobile application for expense tracking and splitting.

## 📱 Tech Stack

- **React Native** with Expo
- **Supabase** - Backend database
- **React Navigation** - Navigation library
- **expo-secure-store** - Secure credential storage
- **expo-linear-gradient** - Beautiful gradient UI

## 📂 Project Structure

```
mobile-app/
├── App.js                          # Main entry point
├── package.json                    # Dependencies
├── src/
│   ├── config/
│   │   └── supabase.js            # Supabase client configuration
│   ├── contexts/
│   │   └── AuthContext.js         # Authentication context
│   ├── navigation/
│   │   └── AppNavigator.js        # Navigation setup
│   └── screens/
│       ├── LoginScreen.js         # Admin login
│       ├── DashboardScreen.js     # Dashboard with stats
│       ├── ExpensesScreen.js      # Expense list
│       ├── AddExpenseScreen.js    # Add expense form
│       ├── MembersScreen.js       # Members management
│       ├── PaymentsScreen.js      # Record payment
│       └── SettlementsScreen.js   # Settlement breakdown
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd mobile-app
npm install
```

### 2. Configure Supabase

Update `src/config/supabase.js` with your Supabase credentials:

1. Go to your Supabase project dashboard
2. Click on **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Key** (Long token starting with `eyJ...`)

4. Replace placeholders in `src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 3. Run the App

```bash
# Start Expo development server
npm start

# Or run directly on:
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### 4. Install Expo Go App

Download Expo Go on your phone:
- **Android**: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

Scan the QR code from the terminal to run the app on your device.

---

## ✨ Features

### 🔐 Authentication
- Admin login with username/password
- Credentials stored securely using `expo-secure-store`
- Auto-login on app restart
- View-only mode without login

### 📊 Dashboard
- Overview statistics (total expenses, members, payments, outstanding)
- Recent expenses list (5 most recent)
- Quick action buttons for common tasks
- Pull-to-refresh

### 💰 Expenses
- List all expenses with search and filter
- Filter by category (Food, Transport, Entertainment, Shopping, Bills, Other)
- Real-time search by description or paid by
- Delete expenses (admin only)
- Floating action button to add expenses
- Category icons and badges

### ➕ Add Expense
- Multi-step form with validation
- Category selection dropdown
- Member selection with chips
- Split among multiple members
- Per-person share auto-calculation
- Date picker
- Loading states and feedback

### 📈 Settlements
- Detailed person-by-person breakdown
- Payment tracking (paid vs remaining)
- Expense history per settlement
- Payment history with dates and notes
- Expandable cards with full details
- Progress bars showing payment completion
- Status badges (Settled/Due)

### 👥 Members
- Member list with balance calculations
- Add/delete members (admin only)
- Visual balance indicators (positive/negative)
- Avatar circles with initials
- Real-time balance calculation
- Pull-to-refresh

### 💳 Payments
- Record payment form with visual representation
- From → To member selection with arrows
- Amount input with currency formatting
- Date picker
- Optional notes field
- Payment summary preview

---

## 🔑 Admin Credentials

**Username:** `admin`  
**Password:** `SoulixGroup@2025`

---

## 📦 Dependencies

```json
{
  "expo": "~51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.5",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@supabase/supabase-js": "^2.39.0",
  "expo-secure-store": "~13.0.2",
  "expo-linear-gradient": "~13.0.2",
  "@react-native-picker/picker": "^2.6.1",
  "react-native-vector-icons": "^10.0.3",
  "react-native-gesture-handler": "~2.16.1",
  "react-native-reanimated": "~3.10.1",
  "react-native-screens": "~3.31.1",
  "react-native-safe-area-context": "4.10.5"
}
```

---

## 🗺️ Navigation Structure

```
Stack Navigator (Root)
├── Login Screen (shown when not authenticated)
└── Main (Bottom Tabs - shown when authenticated)
    ├── Dashboard Tab (📊 icon)
    ├── Expenses Tab (📝 icon)
    ├── Settlements Tab (💳 icon)
    └── Members Tab (👥 icon)

Modal Screens (Stack)
├── AddExpense (presentationStyle: modal)
└── Payments (presentationStyle: modal)
```

---

## 🗄️ Database Schema

The app uses the same Supabase database as the web version:

### Tables
- **admin_users** - Admin authentication (username, password, created_at)
- **expenses** - Expense records (description, amount, category, paid_by, split_among, date)
- **members** - Group members (name, created_at)
- **payments** - Payment records (from_member, to_member, amount, date, notes)

All tables have **RLS (Row Level Security)** policies enabled for data protection.

---

## 🛠️ Development

### File Organization
- **config/** - Configuration files (Supabase client)
- **contexts/** - React contexts (Authentication)
- **navigation/** - Navigation setup (Stack + Tabs)
- **screens/** - App screens/pages

### Styling
- Uses React Native `StyleSheet` for component styling
- Linear gradients for headers (`#667eea` → `#764ba2`)
- Consistent purple color scheme throughout
- Shadow and elevation for depth
- Rounded corners (12-16px radius)
- Modern, clean UI design

### State Management
- React Context API for authentication
- Local state for screen-specific data
- Supabase queries for data fetching
- Pull-to-refresh for data updates

### Icons
- **Emoji icons** for categories (🍔, 🚗, 🎬, 🛍️, 💡, 📦)
- **Ionicons** for navigation tabs
- Native emoji support across platforms

---

## 🔧 Troubleshooting

### Common Issues

**1. Module not found errors**
```bash
# Clear cache and reinstall
npm install
npx expo start -c
```

**2. Supabase connection errors**
- Verify URL and anon key in `src/config/supabase.js`
- Check network connection
- Ensure RLS policies are set up correctly in Supabase dashboard

**3. Navigation errors**
```bash
# Reinstall navigation dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
```

**4. Expo Go not connecting**
- Ensure phone and computer are on same WiFi network
- Try tunnel mode: `npx expo start --tunnel`
- Restart Expo development server

**5. Picker component errors**
```bash
npm install @react-native-picker/picker
```

---

## 🚧 Future Enhancements

- [ ] Offline support with AsyncStorage
- [ ] Push notifications for new expenses/payments
- [ ] Dark mode theme toggle
- [ ] Chart visualizations (pie charts, bar graphs)
- [ ] Export data to PDF/CSV
- [ ] Biometric authentication (Face ID/Touch ID)
- [ ] Camera integration for receipt scanning
- [ ] Split by custom percentages (not just equal splits)
- [ ] Multi-currency support
- [ ] Recurring expenses
- [ ] Customizable expense categories
- [ ] Group chat/comments on expenses
- [ ] Email notifications
- [ ] Expense approval workflow

---

## 📄 License

Private project for **SoulixGroup**

---

## 📞 Support

For issues or questions, please contact the development team.
