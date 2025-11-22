# SplitWise Mobile App

React Native mobile application for the SplitWise Expense Tracker.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- React Native development environment
- Expo CLI (recommended for easier setup)

### Installation

1. Install Expo CLI globally:
```bash
npm install -g expo-cli
```

2. Create new Expo project:
```bash
npx create-expo-app@latest splitwise-mobile
cd splitwise-mobile
```

3. Install dependencies:
```bash
npm install @supabase/supabase-js
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install expo-secure-store
npm install react-native-vector-icons
```

4. Copy the files from the `mobile-app` folder to your Expo project

5. Update Supabase configuration:
   - Open `src/config/supabase.js`
   - Add your Supabase URL and Anon Key

6. Run the app:
```bash
npx expo start
```

## Features

- ✅ Admin Authentication
- ✅ View Dashboard & Statistics
- ✅ Add/Edit/Delete Expenses
- ✅ Manage Members
- ✅ Record Payments
- ✅ View Settlements
- ✅ Balance Tracking
- ✅ Offline Support
- ✅ Push Notifications

## Project Structure

```
splitwise-mobile/
├── App.js                 # Main app entry
├── src/
│   ├── config/
│   │   └── supabase.js   # Supabase configuration
│   ├── contexts/
│   │   └── AuthContext.js # Authentication context
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ExpensesScreen.js
│   │   ├── AddExpenseScreen.js
│   │   ├── MembersScreen.js
│   │   ├── PaymentsScreen.js
│   │   └── SettlementsScreen.js
│   ├── components/
│   │   ├── ExpenseCard.js
│   │   ├── MemberCard.js
│   │   └── StatCard.js
│   └── navigation/
│       └── AppNavigator.js
└── package.json
```

## Credentials

- **Username:** admin
- **Password:** SoulixGroup@2025
