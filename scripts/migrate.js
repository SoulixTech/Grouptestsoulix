require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const { createClient } = require('@supabase/supabase-js');

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3Jwzqhjd_LV4hW6NTNU7NWtRIUmyGSr0",
    authDomain: "paytracker-4fba0.firebaseapp.com",
    databaseURL: "https://paytracker-4fba0-default-rtdb.firebaseio.com",
    projectId: "paytracker-4fba0",
    storageBucket: "paytracker-4fba0.firebasestorage.app",
    messagingSenderId: "852741598872",
    appId: "1:852741598872:web:c5b14453202a6988616aed",
    measurementId: "G-ZFL9GKS07E"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to normalize data (handle both Array and Object)
const normalizeData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(item => item !== null && item !== undefined);
    return Object.values(data);
};

async function migrate() {
    console.log('Starting migration...');
    console.log('Supabase URL:', supabaseUrl);

    try {
        // 1. Fetch data from Firebase
        console.log('Fetching data from Firebase...');
        const membersSnapshot = await get(ref(db, 'members'));
        const expensesSnapshot = await get(ref(db, 'expenses'));
        const paymentsSnapshot = await get(ref(db, 'payments'));

        const membersRaw = membersSnapshot.val();
        const expensesRaw = expensesSnapshot.val();
        const paymentsRaw = paymentsSnapshot.val();

        const members = normalizeData(membersRaw);
        const expenses = normalizeData(expensesRaw);
        const payments = normalizeData(paymentsRaw);

        console.log(`Found ${members.length} members, ${expenses.length} expenses, ${payments.length} payments.`);

        if (members.length === 0 && expenses.length === 0) {
            console.warn('No data found in Firebase to migrate.');
        }

        // 2. Migrate Members
        console.log('Migrating members...');
        for (const memberName of members) {
            if (!memberName) continue;

            // Check if member exists
            const { data: existing, error: fetchError } = await supabase
                .from('members')
                .select('id')
                .eq('name', memberName)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "row not found"
                console.error(`Error checking member ${memberName}:`, fetchError);
                continue;
            }

            if (!existing) {
                const { error } = await supabase
                    .from('members')
                    .insert({ name: memberName });

                if (error) console.error(`Error inserting member ${memberName}:`, error);
                else console.log(`Inserted member: ${memberName}`);
            } else {
                console.log(`Member already exists: ${memberName}`);
            }
        }

        // 3. Migrate Expenses
        console.log('Migrating expenses...');
        for (const expense of expenses) {
            if (!expense) continue;

            const expenseData = {
                description: expense.title || 'Untitled Expense',
                amount: parseFloat(expense.amount) || 0,
                paid_by: expense.paidBy,
                date: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString(),
                involved: expense.splitBetween || [],
                split_type: expense.splitType || 'equal',
                split_details: expense.splitDetails || null,
                category: expense.category || 'General',
                notes: expense.notes || ''
            };

            const { error } = await supabase
                .from('expenses')
                .insert(expenseData);

            if (error) console.error(`Error inserting expense ${expense.title}:`, error);
            else console.log(`Inserted expense: ${expense.title}`);
        }

        // 4. Migrate Payments
        console.log('Migrating payments...');
        for (const payment of payments) {
            if (!payment) continue;

            const paymentData = {
                from_user: payment.from,
                to_user: payment.to,
                amount: parseFloat(payment.amount) || 0,
                date: payment.date ? new Date(payment.date).toISOString() : new Date().toISOString()
            };

            const { error } = await supabase
                .from('payments')
                .insert(paymentData);

            if (error) console.error(`Error inserting payment:`, error);
            else console.log(`Inserted payment from ${payment.from} to ${payment.to}`);
        }

        console.log('Migration complete!');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
