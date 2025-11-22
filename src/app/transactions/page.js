'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { supabase } from '../../lib/supabase'

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([])
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('all') // all, expenses, payments
    const [filterStatus, setFilterStatus] = useState('all') // all, settled, unsettled
    const [editingPayment, setEditingPayment] = useState(null)
    const [editForm, setEditForm] = useState({ from: '', to: '', amount: '', note: '' })

    useEffect(() => {
        fetchAllTransactions()
    }, [])

    const fetchAllTransactions = async () => {
        try {
            setLoading(true)
            
            // Fetch expenses, payments, and members
            const [expensesRes, paymentsRes, membersRes] = await Promise.all([
                supabase.from('expenses').select('*').order('date', { ascending: false }),
                supabase.from('payments').select('*').order('date', { ascending: false }),
                supabase.from('members').select('name')
            ])

            if (expensesRes.error) throw expensesRes.error
            if (paymentsRes.error) throw paymentsRes.error
            if (membersRes.error) throw membersRes.error

            const expenses = expensesRes.data || []
            const payments = paymentsRes.data || []
            const membersList = membersRes.data || []
            const members = membersList.map(m => m.name)

            setMembers(membersList)

            // Calculate balances to determine settlement status
            const balances = calculateBalances(expenses, payments, members)

            // Process expenses with settlement status
            const expenseTransactions = expenses.map(expense => {
                const settled = isExpenseSettled(expense, balances, payments)
                return {
                    id: `exp-${expense.id}`,
                    type: 'expense',
                    date: expense.date,
                    description: expense.description,
                    category: expense.category,
                    amount: expense.amount,
                    paidBy: expense.paid_by,
                    involved: expense.involved || [],
                    splitDetails: expense.split_details || {},
                    settled: settled,
                    originalId: expense.id
                }
            })

            // Process payments
            const paymentTransactions = payments.map(payment => ({
                id: `pay-${payment.id}`,
                type: 'payment',
                date: payment.date,
                description: payment.note || `Payment from ${payment.from_user} to ${payment.to_user}`,
                amount: payment.amount,
                from: payment.from_user,
                to: payment.to_user,
                note: payment.note,
                settled: true, // Payments are always settled
                originalId: payment.id,
                fullData: payment
            }))

            // Combine and sort by date
            const allTransactions = [...expenseTransactions, ...paymentTransactions]
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))

            setTransactions(allTransactions)
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateBalances = (expenses, payments, members) => {
        const balances = {}
        members.forEach(m => balances[m] = 0)

        // Process expenses
        expenses.forEach(expense => {
            const paidBy = expense.paid_by
            const amount = expense.amount

            if (balances[paidBy] !== undefined) {
                balances[paidBy] += amount
            }

            if (expense.split_details) {
                Object.entries(expense.split_details).forEach(([member, splitAmount]) => {
                    if (balances[member] !== undefined) {
                        balances[member] -= splitAmount
                    }
                })
            } else if (expense.involved && expense.involved.length > 0) {
                const splitAmount = amount / expense.involved.length
                expense.involved.forEach(member => {
                    if (balances[member] !== undefined) {
                        balances[member] -= splitAmount
                    }
                })
            }
        })

        // Process payments
        payments.forEach(payment => {
            if (balances[payment.from_user] !== undefined) {
                balances[payment.from_user] += payment.amount
            }
            if (balances[payment.to_user] !== undefined) {
                balances[payment.to_user] -= payment.amount
            }
        })

        return balances
    }

    const isExpenseSettled = (expense, balances, payments) => {
        // Check if all members involved have settled their share
        const involved = expense.involved || []
        const paidBy = expense.paid_by
        
        // If everyone involved is the payer, it's settled
        if (involved.length === 1 && involved[0] === paidBy) return true
        
        // Check if balances are close to zero (within 1 rupee)
        const allBalanced = Object.values(balances).every(balance => Math.abs(balance) < 1)
        
        return allBalanced
    }

    const handleEditPayment = (transaction) => {
        setEditingPayment(transaction.originalId)
        setEditForm({
            from: transaction.from,
            to: transaction.to,
            amount: transaction.amount.toString(),
            note: transaction.note || ''
        })
    }

    const handleUpdatePayment = async (paymentId) => {
        if (!editForm.from || !editForm.to || !editForm.amount) {
            alert('Please fill in all required fields')
            return
        }

        if (editForm.from === editForm.to) {
            alert('Payer and receiver cannot be the same')
            return
        }

        try {
            const { error } = await supabase
                .from('payments')
                .update({
                    from_user: editForm.from,
                    to_user: editForm.to,
                    amount: parseFloat(editForm.amount),
                    note: editForm.note || null
                })
                .eq('id', paymentId)

            if (error) throw error

            setEditingPayment(null)
            setEditForm({ from: '', to: '', amount: '', note: '' })
            fetchAllTransactions()
            alert('Payment updated successfully!')
        } catch (error) {
            console.error('Error updating payment:', error)
            alert('Error updating payment')
        }
    }

    const handleDeletePayment = async (paymentId) => {
        if (!confirm('Are you sure you want to delete this payment?')) return

        try {
            const { error } = await supabase
                .from('payments')
                .delete()
                .eq('id', paymentId)

            if (error) throw error

            fetchAllTransactions()
            alert('Payment deleted successfully!')
        } catch (error) {
            console.error('Error deleting payment:', error)
            alert('Error deleting payment')
        }
    }

    const filteredTransactions = transactions.filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false
        if (filterStatus !== 'all') {
            if (filterStatus === 'settled' && !t.settled) return false
            if (filterStatus === 'unsettled' && t.settled) return false
        }
        return true
    })

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <TopBar title="Transaction History" subtitle="All expenses and payments with settlement status" />

                <div className="content-section active">
                    <div className="widget">
                        <div className="widget-header">
                            <h3>📊 All Transactions</h3>
                            <div className="filter-controls" style={{ display: 'flex', gap: '1rem' }}>
                                <select 
                                    value={filterType} 
                                    onChange={e => setFilterType(e.target.value)}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}
                                >
                                    <option value="all">All Types</option>
                                    <option value="expense">Expenses Only</option>
                                    <option value="payment">Payments Only</option>
                                </select>
                                <select 
                                    value={filterStatus} 
                                    onChange={e => setFilterStatus(e.target.value)}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="settled">Settled</option>
                                    <option value="unsettled">Unsettled</option>
                                </select>
                            </div>
                        </div>

                        <div className="stats-row" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <div className="stat-card" style={{
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '12px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                    {transactions.filter(t => t.type === 'expense').length}
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Expenses</div>
                            </div>
                            <div className="stat-card" style={{
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                borderRadius: '12px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                    {transactions.filter(t => t.type === 'payment').length}
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Payments</div>
                            </div>
                            <div className="stat-card" style={{
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                borderRadius: '12px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                    {transactions.filter(t => t.settled).length}
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Settled Items</div>
                            </div>
                            <div className="stat-card" style={{
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                borderRadius: '12px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                    {transactions.filter(t => !t.settled).length}
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Pending Items</div>
                            </div>
                        </div>

                        <div className="transactions-list">
                            {loading ? (
                                <div className="loading">Loading transactions...</div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="no-data">No transactions found</div>
                            ) : (
                                filteredTransactions.map(transaction => (
                                    <div key={transaction.id} className="transaction-item" style={{
                                        padding: '1.5rem',
                                        background: 'white',
                                        borderRadius: '12px',
                                        marginBottom: '1rem',
                                        borderLeft: `5px solid ${
                                            transaction.type === 'expense' ? '#667eea' : '#f5576c'
                                        }`,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {editingPayment === transaction.originalId && transaction.type === 'payment' ? (
                                            <div style={{ padding: '1rem' }}>
                                                <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>✏️ Edit Payment</h4>
                                                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>From (Payer)</label>
                                                        <select
                                                            value={editForm.from}
                                                            onChange={e => setEditForm({ ...editForm, from: e.target.value })}
                                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                                        >
                                                            <option value="">Select Member</option>
                                                            {members.map(m => (
                                                                <option key={m.id} value={m.name}>{m.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>To (Receiver)</label>
                                                        <select
                                                            value={editForm.to}
                                                            onChange={e => setEditForm({ ...editForm, to: e.target.value })}
                                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                                        >
                                                            <option value="">Select Member</option>
                                                            {members.map(m => (
                                                                <option key={m.id} value={m.name}>{m.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Amount (₹)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editForm.amount}
                                                            onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Note (Optional)</label>
                                                        <input
                                                            type="text"
                                                            value={editForm.note}
                                                            onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                                                            placeholder="Add a note..."
                                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleUpdatePayment(transaction.originalId)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        💾 Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingPayment(null)
                                                            setEditForm({ from: '', to: '', amount: '', note: '' })
                                                        }}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: '#6c757d',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        ✕ Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ 
                                                        fontSize: '2rem',
                                                        filter: 'grayscale(0%)'
                                                    }}>
                                                        {transaction.type === 'expense' ? '💰' : '💸'}
                                                    </span>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                                                            {transaction.description}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                            📅 {new Date(transaction.date).toLocaleDateString('en-US', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {transaction.type === 'expense' && (
                                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                        <div style={{
                                                            padding: '0.5rem 1rem',
                                                            background: '#f0f0f0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            <strong>Paid by:</strong> {transaction.paidBy}
                                                        </div>
                                                        {transaction.category && (
                                                            <div style={{
                                                                padding: '0.5rem 1rem',
                                                                background: '#e3f2fd',
                                                                borderRadius: '8px',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                📁 {transaction.category}
                                                            </div>
                                                        )}
                                                        <div style={{
                                                            padding: '0.5rem 1rem',
                                                            background: '#fff3e0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            👥 {transaction.involved.length} {transaction.involved.length === 1 ? 'person' : 'people'}
                                                        </div>
                                                    </div>
                                                )}

                                                {transaction.type === 'payment' && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <div style={{
                                                            padding: '0.8rem',
                                                            background: '#f5f5f5',
                                                            borderRadius: '8px',
                                                            fontSize: '0.95rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <strong>{transaction.from}</strong> 
                                                            <span style={{ color: 'var(--text-secondary)' }}>→</span> 
                                                            <strong>{transaction.to}</strong>
                                                        </div>
                                                        {transaction.note && (
                                                            <div style={{
                                                                marginTop: '0.5rem',
                                                                padding: '0.5rem',
                                                                background: '#f0f7ff',
                                                                borderRadius: '8px',
                                                                fontSize: '0.85rem',
                                                                fontStyle: 'italic',
                                                                borderLeft: '3px solid #2196f3'
                                                            }}>
                                                                📝 {transaction.note}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: '1.5rem',
                                                    fontWeight: 'bold',
                                                    color: transaction.type === 'expense' ? '#667eea' : '#f5576c',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    ₹{transaction.amount.toFixed(2)}
                                                </div>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '0.4rem 1rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    background: transaction.settled 
                                                        ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                                                        : 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
                                                    color: 'white',
                                                    boxShadow: transaction.settled
                                                        ? '0 2px 8px rgba(17, 153, 142, 0.3)'
                                                        : '0 2px 8px rgba(255, 167, 38, 0.3)'
                                                }}>
                                                    {transaction.settled ? '✅ Settled' : '⏳ Pending'}
                                                </div>
                                                
                                                {transaction.type === 'payment' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => handleEditPayment(transaction)}
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePayment(transaction.originalId)}
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
