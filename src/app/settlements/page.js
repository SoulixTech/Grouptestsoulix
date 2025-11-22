'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import AIChatbot from '../../components/AIChatbot'
import { supabase } from '../../lib/supabase'

export default function SettlementsPage() {
    const [settlements, setSettlements] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedSettlement, setExpandedSettlement] = useState(null)
    const [members, setMembers] = useState([])
    const [expenses, setExpenses] = useState([])
    const [payments, setPayments] = useState([])

    useEffect(() => {
        calculateSettlements()
    }, [])

    const calculateSettlements = async () => {
        try {
            setLoading(true)

            // Fetch all necessary data
            const { data: membersData } = await supabase.from('members').select('*')
            const { data: expensesData } = await supabase.from('expenses').select('*')
            const { data: paymentsData } = await supabase.from('payments').select('*')

            if (!membersData || !expensesData) return

            setMembers(membersData || [])
            setExpenses(expensesData || [])
            setPayments(paymentsData || [])

            const members = membersData.map(m => m.name)
            const balances = {}
            const allMemberExpenses = {} // Track ALL expenses for each member
            
            members.forEach(m => {
                balances[m] = 0
                allMemberExpenses[m] = []
            })

            // Process expenses and track ALL of them for each person
            expensesData.forEach(expense => {
                const paidBy = expense.paid_by
                const amount = expense.amount

                // Credit the payer
                if (balances[paidBy] !== undefined) {
                    balances[paidBy] += amount
                }

                // Debit the involved members and track ALL expenses they're part of
                if (expense.involved && expense.involved.length > 0) {
                    if (expense.split_details) {
                        Object.entries(expense.split_details).forEach(([member, splitAmount]) => {
                            if (balances[member] !== undefined) {
                                balances[member] -= splitAmount
                                // Track expense for this member (regardless of who paid)
                                if (member !== paidBy) { // Don't track if they paid for themselves
                                    allMemberExpenses[member].push({
                                        description: expense.description,
                                        category: expense.category,
                                        paidBy: paidBy,
                                        yourShare: splitAmount,
                                        totalAmount: amount,
                                        date: expense.date,
                                        splitWith: expense.involved.length
                                    })
                                }
                            }
                        })
                    } else {
                        const splitAmount = amount / expense.involved.length
                        expense.involved.forEach(member => {
                            if (balances[member] !== undefined) {
                                balances[member] -= splitAmount
                                // Track expense for this member (regardless of who paid)
                                if (member !== paidBy) { // Don't track if they paid for themselves
                                    allMemberExpenses[member].push({
                                        description: expense.description,
                                        category: expense.category,
                                        paidBy: paidBy,
                                        yourShare: splitAmount,
                                        totalAmount: amount,
                                        date: expense.date,
                                        splitWith: expense.involved.length
                                    })
                                }
                            }
                        })
                    }
                }
            })

            // Process payments (settlements already made)
            if (paymentsData) {
                paymentsData.forEach(payment => {
                    if (balances[payment.from_user] !== undefined) {
                        balances[payment.from_user] += payment.amount
                    }
                    if (balances[payment.to_user] !== undefined) {
                        balances[payment.to_user] -= payment.amount
                    }
                })
            }

            // Create detailed settlements showing each person's debts
            const detailedSettlements = []
            
            // For each member who owes money (negative balance)
            Object.entries(balances).forEach(([member, balance]) => {
                if (balance < -0.01) {
                    // This person owes money
                    const memberExpenses = allMemberExpenses[member] || []
                    
                    // Group expenses by who paid
                    const expensesByPayer = {}
                    memberExpenses.forEach(expense => {
                        if (!expensesByPayer[expense.paidBy]) {
                            expensesByPayer[expense.paidBy] = []
                        }
                        expensesByPayer[expense.paidBy].push(expense)
                    })
                    
                    // Create a settlement entry for each person they owe
                    Object.entries(expensesByPayer).forEach(([payer, expenses]) => {
                        const totalOwed = expenses.reduce((sum, exp) => sum + exp.yourShare, 0)
                        
                        // Calculate how much has been paid already
                        const paidAmount = paymentsData
                            ? paymentsData
                                .filter(p => p.from_user === member && p.to_user === payer)
                                .reduce((sum, p) => sum + p.amount, 0)
                            : 0
                        
                        const remainingAmount = totalOwed - paidAmount
                        
                        // Get payment records for this relationship
                        const paymentRecords = paymentsData
                            ? paymentsData.filter(p => p.from_user === member && p.to_user === payer)
                            : []
                        
                        detailedSettlements.push({
                            from: member,
                            to: payer,
                            amount: totalOwed,
                            paidAmount: paidAmount,
                            remainingAmount: remainingAmount,
                            expenses: expenses,
                            expensesTotal: totalOwed,
                            payments: paymentRecords
                        })
                    })
                }
            })
            
            // Sort by debtor name, then by amount
            detailedSettlements.sort((a, b) => {
                if (a.from !== b.from) {
                    return a.from.localeCompare(b.from)
                }
                return b.amount - a.amount
            })

            setSettlements(detailedSettlements)

        } catch (error) {
            console.error('Error calculating settlements:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Sidebar />
            <AIChatbot expenses={expenses} members={members} payments={payments} />
            <div className="main-content">
                <TopBar title="Settlements" subtitle="Optimal payment suggestions" />

                <div className="content-section active">
                    <div className="widget">
                        <h3>💳 Settlement Suggestions</h3>
                        <p className="section-description">Optimized settlement plan to balance everyone</p>

                        <div className="settlement-list">
                            {loading ? (
                                <div className="loading">Calculating settlements...</div>
                            ) : settlements.length === 0 ? (
                                <div className="no-data">
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                    <h3>All Settled Up!</h3>
                                    <p>No one owes anything.</p>
                                </div>
                            ) : (
                                <div className="settlements-grid" style={{ display: 'grid', gap: '1rem' }}>
                                    {settlements.map((settlement, index) => (
                                        <div key={index} style={{ marginBottom: '1rem' }}>
                                            <div 
                                                className="settlement-card" 
                                                style={{
                                                    padding: '1.5rem',
                                                    background: 'white',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    border: '1px solid var(--border-color)',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                    cursor: settlement.expenses?.length > 0 ? 'pointer' : 'default',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={() => {
                                                    if (settlement.expenses?.length > 0) {
                                                        setExpandedSettlement(expandedSettlement === index ? null : index)
                                                    }
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div className="settlement-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{settlement.from}</div>
                                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>pays</div>
                                                        </div>
                                                        <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>→</div>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{settlement.to}</div>
                                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>receives</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>
                                                                Total Owed
                                                            </div>
                                                            <div className="settlement-amount" style={{
                                                                fontSize: '1.3rem',
                                                                fontWeight: 'bold',
                                                                color: settlement.remainingAmount <= 0.01 ? '#10b981' : '#f59e0b'
                                                            }}>
                                                                ₹{settlement.amount.toFixed(2)}
                                                            </div>
                                                            {settlement.paidAmount > 0 && (
                                                                <>
                                                                    <div style={{ 
                                                                        fontSize: '0.8rem', 
                                                                        color: '#10b981',
                                                                        marginTop: '0.3rem',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        ✓ Paid: ₹{settlement.paidAmount.toFixed(2)}
                                                                    </div>
                                                                    <div style={{ 
                                                                        fontSize: '0.85rem', 
                                                                        color: settlement.remainingAmount <= 0.01 ? '#10b981' : '#dc2626',
                                                                        marginTop: '0.2rem',
                                                                        fontWeight: '700',
                                                                        padding: '0.3rem 0.6rem',
                                                                        background: settlement.remainingAmount <= 0.01 ? '#d1fae5' : '#fee2e2',
                                                                        borderRadius: '6px'
                                                                    }}>
                                                                        {settlement.remainingAmount <= 0.01 ? '✅ Settled' : `Due: ₹${settlement.remainingAmount.toFixed(2)}`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        {settlement.expenses?.length > 0 && (
                                                            <div style={{
                                                                padding: '0.5rem 1rem',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                color: 'white',
                                                                borderRadius: '8px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                {settlement.expenses.length} {settlement.expenses.length === 1 ? 'Expense' : 'Expenses'}
                                                                <span style={{ marginLeft: '0.5rem' }}>
                                                                    {expandedSettlement === index ? '▲' : '▼'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {expandedSettlement === index && settlement.expenses?.length > 0 && (
                                                    <div style={{
                                                        marginTop: '1.5rem',
                                                        paddingTop: '1.5rem',
                                                        borderTop: '2px solid #f0f0f0'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.95rem',
                                                            fontWeight: '600',
                                                            marginBottom: '1rem',
                                                            color: 'var(--primary-color)'
                                                        }}>
                                                            📋 Expenses {settlement.from} owes {settlement.to} for:
                                                        </div>
                                                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                                                            {settlement.expenses.map((expense, expIndex) => (
                                                                <div key={expIndex} style={{
                                                                    padding: '1rem',
                                                                    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                                                                    borderRadius: '10px',
                                                                    borderLeft: '4px solid #e17055',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    gap: '1rem'
                                                                }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ 
                                                                            fontWeight: '600', 
                                                                            fontSize: '1rem',
                                                                            marginBottom: '0.3rem',
                                                                            color: '#2c3e50'
                                                                        }}>
                                                                            {expense.description}
                                                                        </div>
                                                                        <div style={{ 
                                                                            fontSize: '0.85rem', 
                                                                            color: '#5a6c7d',
                                                                            display: 'flex',
                                                                            gap: '1rem',
                                                                            flexWrap: 'wrap',
                                                                            marginTop: '0.5rem'
                                                                        }}>
                                                                            {expense.category && (
                                                                                <span style={{
                                                                                    padding: '0.2rem 0.6rem',
                                                                                    background: 'rgba(102, 126, 234, 0.15)',
                                                                                    borderRadius: '6px',
                                                                                    fontSize: '0.8rem'
                                                                                }}>
                                                                                    📁 {expense.category}
                                                                                </span>
                                                                            )}
                                                                            <span>
                                                                                📅 {new Date(expense.date).toLocaleDateString('en-US', {
                                                                                    day: 'numeric',
                                                                                    month: 'short',
                                                                                    year: 'numeric'
                                                                                })}
                                                                            </span>
                                                                            <span style={{ fontSize: '0.8rem' }}>
                                                                                👥 Split: {expense.splitWith} {expense.splitWith === 1 ? 'person' : 'people'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <div style={{
                                                                            fontSize: '0.75rem',
                                                                            color: '#636e72',
                                                                            marginBottom: '0.2rem'
                                                                        }}>
                                                                            Your share
                                                                        </div>
                                                                        <div style={{
                                                                            fontWeight: 'bold',
                                                                            fontSize: '1.1rem',
                                                                            color: '#e17055',
                                                                            whiteSpace: 'nowrap'
                                                                        }}>
                                                                            ₹{(expense.yourShare || 0).toFixed(2)}
                                                                        </div>
                                                                        <div style={{
                                                                            fontSize: '0.7rem',
                                                                            color: '#95a5a6',
                                                                            marginTop: '0.2rem'
                                                                        }}>
                                                                            of ₹{(expense.totalAmount || 0).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div style={{
                                                            marginTop: '1rem',
                                                            padding: '1rem',
                                                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                            borderRadius: '8px',
                                                            color: 'white'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '1rem',
                                                                fontWeight: '600',
                                                                marginBottom: '0.8rem'
                                                            }}>
                                                                💰 Settlement Summary:
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                                Total expenses paid by {settlement.to}: <strong>₹{(settlement.expensesTotal || 0).toFixed(2)}</strong>
                                                            </div>
                                                            
                                                            {settlement.paidAmount > 0 && (
                                                                <>
                                                                    <div style={{ 
                                                                        margin: '1rem 0',
                                                                        padding: '0.8rem',
                                                                        background: 'rgba(255,255,255,0.15)',
                                                                        borderRadius: '6px'
                                                                    }}>
                                                                        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                                                                            💳 Payment History:
                                                                        </div>
                                                                        {settlement.payments && settlement.payments.map((payment, pIdx) => (
                                                                            <div key={pIdx} style={{ 
                                                                                fontSize: '0.85rem', 
                                                                                marginBottom: '0.3rem',
                                                                                paddingLeft: '0.5rem',
                                                                                borderLeft: '2px solid rgba(255,255,255,0.4)'
                                                                            }}>
                                                                                ✓ Paid ₹{payment.amount.toFixed(2)} on {new Date(payment.date).toLocaleDateString('en-US', {
                                                                                    day: 'numeric',
                                                                                    month: 'short',
                                                                                    year: 'numeric'
                                                                                })}
                                                                                {payment.note && <span style={{ fontStyle: 'italic', opacity: 0.8 }}> - {payment.note}</span>}
                                                                            </div>
                                                                        ))}
                                                                        <div style={{ 
                                                                            fontSize: '0.9rem', 
                                                                            fontWeight: '600', 
                                                                            marginTop: '0.5rem',
                                                                            paddingTop: '0.5rem',
                                                                            borderTop: '1px solid rgba(255,255,255,0.3)'
                                                                        }}>
                                                                            Total Paid: ₹{settlement.paidAmount.toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                            
                                                            <div style={{ 
                                                                fontSize: '0.9rem', 
                                                                fontWeight: '700', 
                                                                marginTop: '0.8rem', 
                                                                padding: '0.8rem', 
                                                                background: settlement.remainingAmount <= 0.01 
                                                                    ? 'rgba(16, 185, 129, 0.3)' 
                                                                    : 'rgba(255,255,255,0.2)', 
                                                                borderRadius: '6px', 
                                                                textAlign: 'center',
                                                                border: settlement.remainingAmount <= 0.01 
                                                                    ? '2px solid rgba(255,255,255,0.5)' 
                                                                    : 'none'
                                                            }}>
                                                                {settlement.remainingAmount <= 0.01 ? (
                                                                    <>✅ All Settled! Payment Complete!</>
                                                                ) : (
                                                                    <>💡 Remaining: ₹{settlement.remainingAmount.toFixed(2)}</>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
