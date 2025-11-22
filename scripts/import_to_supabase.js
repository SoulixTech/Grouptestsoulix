require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
    console.log('Starting import to Supabase...');

    try {
        const data = JSON.parse(fs.readFileSync('firebase_data.json', 'utf8'));

        console.log(`Found ${data.members.length} members, ${data.expenses.length} expenses, ${data.payments.length} payments`);

        // 1. Import Members
        console.log('Importing members...');
        for (const memberName of data.members) {
            const { error } = await supabase
                .from('members')
                .insert({ name: memberName });

            if (error && error.code !== '23505') { // 23505 is duplicate key error
                console.error(`Error inserting member ${memberName}:`, error.message);
            } else {
                console.log(`✓ ${memberName}`);
            }
        }

        // 2. Import Expenses
        console.log('\nImporting expenses...');
        for (const expense of data.expenses) {
            const { error } = await supabase
                .from('expenses')
                .insert({
                    description: expense.title,
                    amount: expense.amount,
                    paid_by: expense.paidBy,
                    date: new Date(expense.date).toISOString(),
                    involved: expense.splitBetween,
                    split_type: expense.splitType,
                    split_details: expense.splitDetails,
                    category: expense.category,
                    notes: expense.notes
                });

            if (error) {
                console.error(`Error inserting expense ${expense.title}:`, error.message);
            } else {
                console.log(`✓ ${expense.title}`);
            }
        }

        // 3. Import Payments
        console.log('\nImporting payments...');
        for (const payment of data.payments) {
            const { error } = await supabase
                .from('payments')
                .insert({
                    from_user: payment.from,
                    to_user: payment.to,
                    amount: payment.amount,
                    date: new Date(payment.date).toISOString()
                });

            if (error) {
                console.error(`Error inserting payment:`, error.message);
            } else {
                console.log(`✓ ${payment.from} → ${payment.to}: ₹${payment.amount}`);
            }
        }

        console.log('\n✅ Import complete!');
        process.exit(0);

    } catch (error) {
        console.error('Import failed:', error.message);
        process.exit(1);
    }
}

importData();
