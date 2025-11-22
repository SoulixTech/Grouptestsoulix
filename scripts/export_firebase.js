require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const fs = require('fs');

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

async function exportData() {
    console.log('Starting export...');
    try {
        const membersSnapshot = await get(ref(db, 'members'));
        const expensesSnapshot = await get(ref(db, 'expenses'));
        const paymentsSnapshot = await get(ref(db, 'payments'));

        const data = {
            members: membersSnapshot.val() || [],
            expenses: expensesSnapshot.val() || [],
            payments: paymentsSnapshot.val() || []
        };

        fs.writeFileSync('firebase_data.json', JSON.stringify(data, null, 2));
        console.log('Data exported to firebase_data.json');
        console.log(`Counts: Members ${Array.isArray(data.members) ? data.members.length : Object.keys(data.members).length}, Expenses ${Array.isArray(data.expenses) ? data.expenses.length : Object.keys(data.expenses).length}, Payments ${Array.isArray(data.payments) ? data.payments.length : Object.keys(data.payments).length}`);
        process.exit(0);
    } catch (error) {
        console.error('Export failed:', error);
        process.exit(1);
    }
}

exportData();
