'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import AIChatbot from '../../components/AIChatbot'
import { supabase } from '../../lib/supabase'
import { useSync } from '../../contexts/SyncContext'

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalExpenses: 0,
        transactionCount: 0,
        memberCount: 0
    })
    const [recentExpenses, setRecentExpenses] = useState([])
    const [allExpenses, setAllExpenses] = useState([])
    const [members, setMembers] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const { syncStatus } = useSync()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    // Auto-refresh when data changes from other devices
    useEffect(() => {
        const handleDataUpdate = () => {
            console.log('Data updated - refreshing dashboard')
            fetchDashboardData()
        }

        window.addEventListener('dataUpdated', handleDataUpdate)
        return () => window.removeEventListener('dataUpdated', handleDataUpdate)
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch expenses stats
            const { data: expenses, error: expensesError } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false })

            if (expensesError) throw expensesError
            setAllExpenses(expenses || [])

            // Fetch members count
            const { data: membersData, count: memberCount, error: membersError } = await supabase
                .from('members')
                .select('*', { count: 'exact' })

            if (membersError) throw membersError
            setMembers(membersData || [])

            // Fetch payments
            const { data: paymentsData } = await supabase
                .from('payments')
                .select('*')
            setPayments(paymentsData || [])

            const totalAmount = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0

            setStats({
                totalExpenses: totalAmount,
                transactionCount: expenses?.length || 0,
                memberCount: memberCount || 0
            })

            // Fetch recent expenses details
            const { data: recent, error: recentError } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false })
                .limit(5)

            if (recentError) throw recentError
            setRecentExpenses(recent || [])

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Sidebar />
            <AIChatbot expenses={allExpenses} members={members} payments={payments} />
            <div className="main-content">
                <TopBar title="Dashboard" subtitle="Overview of your group expenses" />

                <div className="content-section active">
                    {/* Quick Stats */}
                    <div className="widget">
                        <h3>📊 Quick Overview</h3>
                        <div className="overview-grid">
                            <div className="overview-card">
                                <div className="overview-label">TOTAL EXPENSES</div>
                                <div className="overview-value">
                                    {loading ? '...' : `₹${stats.totalExpenses.toFixed(2)}`}
                                </div>
                                <div className="overview-subtitle">
                                    {loading ? '...' : `${stats.transactionCount} transactions`}
                                </div>
                            </div>
                            <div className="overview-card purple">
                                <div className="overview-label">MEMBERS</div>
                                <div className="overview-value">
                                    {loading ? '...' : stats.memberCount}
                                </div>
                                <div className="overview-subtitle">Active members</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Expenses */}
                    <div className="widget">
                        <h3>📝 Recent Expenses</h3>
                        <div className="expense-list">
                            {loading ? (
                                <div className="loading">Loading...</div>
                            ) : recentExpenses.length === 0 ? (
                                <div className="no-data">No expenses yet. Add your first expense!</div>
                            ) : (
                                recentExpenses.map(expense => (
                                    <div key={expense.id} className="expense-item">
                                        <div className="expense-header">
                                            <div className="expense-main-info">
                                                <div>
                                                    <span className="expense-title">{expense.description}</span>
                                                    <span className="expense-category">{expense.category}</span>
                                                </div>
                                                <div className="expense-details">
                                                    <div className="expense-detail">
                                                        <strong>📅 Date:</strong> {new Date(expense.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="expense-detail">
                                                        <strong>💳 Paid by:</strong> {expense.paid_by}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="expense-amount">₹{expense.amount.toFixed(2)}</div>
                                        </div>
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
