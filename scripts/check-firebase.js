require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

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

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

async function checkData() {
    console.log('Fetching data from Firebase...');
    try {
        const membersSnapshot = await get(ref(db, 'members'));
        const expensesSnapshot = await get(ref(db, 'expenses'));

        const members = membersSnapshot.val();
        const expenses = expensesSnapshot.val();

        console.log('Members type:', typeof members);
        console.log('Members is array?', Array.isArray(members));
        console.log('Members sample:', JSON.stringify(members, null, 2));

        console.log('Expenses type:', typeof expenses);
        console.log('Expenses is array?', Array.isArray(expenses));
        console.log('Expenses sample:', JSON.stringify(expenses, null, 2));

    } catch (error) {
        console.error('Error fetching data:', error);
    }
    process.exit(0);
}

checkData();
