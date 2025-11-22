const fs = require('fs');
const path = require('path');

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    console.log(message);
    try {
        fs.appendFileSync('migration_log.txt', logMessage);
    } catch (e) {
        // ignore
    }
}

log('Script started');

require('dotenv').config({ path: '.env.local' });
log('Dotenv loaded');

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const { createClient } = require('@supabase/supabase-js');
log('Libraries loaded');

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
try {
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getDatabase(firebaseApp);
    log('Firebase initialized');
} catch (e) {
    log('Firebase init failed: ' + e.message);
    process.exit(1);
}

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

log('Supabase URL: ' + supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
    log('Error: Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
log('Supabase initialized');

// Helper to normalize data (handle both Array and Object)
const normalizeData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(item => item !== null && item !== undefined);
    return Object.values(data);
};

async function migrate() {
    log('Starting migration function...');

    try {
        // 1. Fetch data from Firebase
        log('Fetching data from Firebase...');
        const membersSnapshot = await get(ref(db, 'members'));
        log('Members fetched');
        const expensesSnapshot = await get(ref(db, 'expenses'));
        log('Expenses fetched');
        const paymentsSnapshot = await get(ref(db, 'payments'));
        log('Payments fetched');

        const membersRaw = membersSnapshot.val();
        const expensesRaw = expensesSnapshot.val();
        const paymentsRaw = paymentsSnapshot.val();

        const members = normalizeData(membersRaw);
        const expenses = normalizeData(expensesRaw);
        const payments = normalizeData(paymentsRaw);

        log(`Found ${members.length} members, ${expenses.length} expenses, ${payments.length} payments.`);

        // 2. Migrate Members
        log('Migrating members...');
        for (const memberName of members) {
            // Check if member exists
            const { data: existing } = await supabase
                .from('members')
                .select('id')
                .eq('name', memberName)
                .single();

            if (!existing) {
                const { error } = await supabase
                    .from('members')
                    .insert({ name: memberName });

                if (error) log(`Error inserting member ${memberName}: ${error.message}`);
                else log(`Inserted member: ${memberName}`);
            }
        }

        // 3. Migrate Expenses
        log('Migrating expenses...');
        for (const expense of expenses) {
            if (!expense) continue;

            const { error } = await supabase
                .from('expenses')
                .insert({
                    description: expense.title,
                    amount: expense.amount,
                    paid_by: expense.paidBy,
                    date: new Date(expense.date).toISOString(),
                    involved: expense.splitBetween || [],
                    split_type: expense.splitType || 'equal',
                    split_details: expense.splitDetails || null,
                    category: expense.category || 'General',
                    notes: expense.notes || ''
                });

            if (error) log(`Error inserting expense ${expense.title}: ${error.message}`);
            else log(`Inserted expense: ${expense.title}`);
        }

        // 4. Migrate Payments
        log('Migrating payments...');
        for (const payment of payments) {
            if (!payment) continue;

            const { error } = await supabase
                .from('payments')
                .insert({
                    from_user: payment.from,
                    to_user: payment.to,
                    amount: payment.amount,
                    date: payment.date ? new Date(payment.date).toISOString() : new Date().toISOString()
                });

            if (error) log(`Error inserting payment: ${error.message}`);
            else log(`Inserted payment`);
        }

        log('Migration complete!');
        process.exit(0);

    } catch (error) {
        log('Migration failed: ' + error.message);
        process.exit(1);
    }
}

migrate();
