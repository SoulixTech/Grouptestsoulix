'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const showSuccessNotification = (message) => {
    // Create notification element
    const notification = document.createElement('div')
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.5);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(102, 126, 234, 0.6);
            z-index: 10000;
            text-align: center;
            opacity: 0;
            animation: successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        ">
            <div style="font-size: 4rem; margin-bottom: 1rem; animation: checkBounce 0.6s ease-in-out 0.2s;">✓</div>
            <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 0.5rem;">${message}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">Redirecting to expenses...</div>
        </div>
    `
    
    // Add animations
    const style = document.createElement('style')
    style.textContent = `
        @keyframes successPop {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        @keyframes checkBounce {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.2);
            }
        }
    `
    document.head.appendChild(style)
    document.body.appendChild(notification)
    
    // Remove after animation
    setTimeout(() => {
        notification.style.opacity = '0'
        notification.style.transform = 'translate(-50%, -50%) scale(0.8)'
        notification.style.transition = 'all 0.3s ease'
        setTimeout(() => {
            notification.remove()
            style.remove()
        }, 300)
    }, 1300)
}

export default function AddExpensePage() {
    const router = useRouter()
    const { isAdmin } = useAuth()
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        category: 'Food & Drinks',
        amount: '',
        paidBy: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        splitType: 'equal',
        involved: []
    })

    useEffect(() => {
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('name')

            if (error) throw error
            setMembers(data || [])
            // Start with empty selection - user will select members manually
            setFormData(prev => ({ ...prev, involved: [] }))
        } catch (error) {
            console.error('Error fetching members:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!formData.title || !formData.amount || !formData.paidBy) {
                alert('Please fill in all required fields')
                return
            }

            const expenseData = {
                description: formData.title,
                amount: parseFloat(formData.amount),
                paid_by: formData.paidBy,
                date: new Date(formData.date).toISOString(),
                category: formData.category,
                notes: formData.notes,
                split_type: formData.splitType,
                involved: formData.involved,
                split_details: null // Simplified for now, can be enhanced later
            }

            const { error } = await supabase
                .from('expenses')
                .insert([expenseData])

            if (error) throw error

            // Show beautiful success notification
            showSuccessNotification('Expense added successfully!')
            
            // Wait a moment before redirecting
            setTimeout(() => {
                router.push('/expenses')
            }, 1500)
        } catch (error) {
            console.error('Error adding expense:', error)
            alert('Error adding expense')
        } finally {
            setLoading(false)
        }
    }

    const handleCheckboxChange = (memberName) => {
        setFormData(prev => {
            const newInvolved = prev.involved.includes(memberName)
                ? prev.involved.filter(m => m !== memberName)
                : [...prev.involved, memberName]
            return { ...prev, involved: newInvolved }
        })
    }

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <TopBar title="Add Expense" subtitle="Record a new group expense" />

                {!isAdmin && (
                    <div style={{
                        padding: '1rem 1.5rem',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: 'white',
                        margin: '1rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                        textAlign: 'center',
                        boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
                    }}>
                        🔒 Read-Only Mode - Login as admin to add expenses
                    </div>
                )}

                <div className="content-section active">
                    <div className="form-card">
                        <div className="card-header">
                            <h2>➕ Add New Expense</h2>
                            <p>Record a new group expense</p>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="expenseTitle">Event/Trip Name *</label>
                                        <input
                                            type="text"
                                            id="expenseTitle"
                                            placeholder="e.g., Birthday Party, Night Out"
                                            required
                                            disabled={!isAdmin}
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="expenseCategory">Category *</label>
                                        <select
                                            id="expenseCategory"
                                            required
                                            disabled={!isAdmin}
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Food & Drinks">🍔 Food & Drinks</option>
                                            <option value="Transportation">🚗 Transportation</option>
                                            <option value="Entertainment">🎉 Entertainment</option>
                                            <option value="Other">📌 Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="expenseAmount">Total Amount (₹) *</label>
                                        <input
                                            type="number"
                                            id="expenseAmount"
                                            placeholder="0.00"
                                            step="0.01"
                                            required
                                            disabled={!isAdmin}
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="paidBy">Paid By *</label>
                                        <select
                                            id="paidBy"
                                            required
                                            disabled={!isAdmin}
                                            value={formData.paidBy}
                                            onChange={e => setFormData({ ...formData, paidBy: e.target.value })}
                                        >
                                            <option value="">Select Member</option>
                                            {members.map(member => (
                                                <option key={member.id} value={member.name}>{member.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="expenseDate">Date *</label>
                                        <input
                                            type="date"
                                            id="expenseDate"
                                            required
                                            disabled={!isAdmin}
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Split Between</label>
                                    <div className="split-members-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                        {members.map(member => (
                                            <div key={member.id} className="checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    id={`split-${member.id}`}
                                                    checked={formData.involved.includes(member.name)}
                                                    disabled={!isAdmin}
                                                    onChange={() => handleCheckboxChange(member.name)}
                                                />
                                                <label htmlFor={`split-${member.id}`} style={{ marginLeft: '8px' }}>{member.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="expenseNotes">Notes (Optional)</label>
                                    <textarea
                                        id="expenseNotes"
                                        placeholder="Add any additional details..."
                                        rows={3}
                                        disabled={!isAdmin}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-success btn-large" disabled={loading || !isAdmin}>
                                    <span>{loading ? 'Saving...' : !isAdmin ? '🔒 Admin Only' : '💾 Add Expense'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
