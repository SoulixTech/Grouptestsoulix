# Group Expense Tracker - Next.js

A modern expense tracking application built with Next.js, Tailwind CSS, and Supabase.

## Features

- 📊 Dashboard with expense overview
- 🧮 Quick split calculator
- ➕ Add and manage expenses
- 👥 Member management
- 💵 Balance tracking
- 💳 Settlement suggestions
- 📈 Statistics and analytics

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS + Custom CSS
- **Database**: Supabase
- **Performance**: Million.js
- **Monitoring**: React Scan

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

Create the following tables in your Supabase database:

### Members Table
```sql
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paid_by TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT,
  notes TEXT,
  split_type TEXT DEFAULT 'equal',
  split_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  from_member TEXT NOT NULL,
  to_member TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT,
  date TIMESTAMP DEFAULT NOW()
);
```

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   ├── members/
│   ├── quick-split/
│   ├── expenses/
│   ├── add-expense/
│   ├── balances/
│   ├── settlements/
│   ├── payments/
│   ├── statistics/
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── components/
│   ├── Sidebar.js
│   └── TopBar.js
├── context/
└── lib/
    └── supabase.js
```

## License

MIT
