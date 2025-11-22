'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function PaymentsPage() {
    const { isAdmin } = useAuth()
    const [payments, setPayments] = useState([])
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingPayment, setEditingPayment] = useState(null)

    const [formData, setFormData] = useState({
        from: '',
        to: '',
        amount: '',
        note: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [paymentsRes, membersRes] = await Promise.all([
                supabase.from('payments').select('*').order('date', { ascending: false }),
                supabase.from('members').select('*').order('name')
            ])

            if (paymentsRes.error) throw paymentsRes.error
            if (membersRes.error) throw membersRes.error

            setPayments(paymentsRes.data || [])
            setMembers(membersRes.data || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.from || !formData.to || !formData.amount) {
            alert('Please fill in all fields')
            return
        }

        if (formData.from === formData.to) {
            alert('Payer and receiver cannot be the same')
            return
        }

        try {
            if (editingPayment) {
                // Update existing payment
                const { data, error } = await supabase
                    .from('payments')
                    .update({
                        from_user: formData.from,
                        to_user: formData.to,
                        amount: parseFloat(formData.amount),
                        note: formData.note || null
                    })
                    .eq('id', editingPayment.id)
                    .select()

                if (error) throw error

                if (data) {
                    setPayments(payments.map(p => p.id === editingPayment.id ? data[0] : p))
                    setShowForm(false)
                    setEditingPayment(null)
                    setFormData({ from: '', to: '', amount: '', note: '' })
                    alert('Payment updated successfully!')
                }
            } else {
                // Insert new payment
                const { data, error } = await supabase
                    .from('payments')
                    .insert([{
                        from_user: formData.from,
                        to_user: formData.to,
                        amount: parseFloat(formData.amount),
                        note: formData.note || null,
                        date: new Date().toISOString()
                    }])
                    .select()

                if (error) throw error

                if (data) {
                    setPayments([data[0], ...payments])
                    setShowForm(false)
                    setFormData({ from: '', to: '', amount: '', note: '' })
                    alert('Payment recorded successfully!')
                }
            }
        } catch (error) {
            console.error('Error recording payment:', error)
            alert('Error recording payment')
        }
    }

    const handleEdit = (payment) => {
        setEditingPayment(payment)
        setFormData({
            from: payment.from_user,
            to: payment.to_user,
            amount: payment.amount.toString(),
            note: payment.note || ''
        })
        setShowForm(true)
    }

    const handleCancelEdit = () => {
        setShowForm(false)
        setEditingPayment(null)
        setFormData({ from: '', to: '', amount: '', note: '' })
    }

    const handleDelete = async (paymentId) => {
        if (!confirm('Are you sure you want to delete this payment?')) return

        try {
            const { error } = await supabase
                .from('payments')
                .delete()
                .eq('id', paymentId)

            if (error) throw error

            setPayments(payments.filter(p => p.id !== paymentId))
            alert('Payment deleted successfully!')
        } catch (error) {
            console.error('Error deleting payment:', error)
            alert('Error deleting payment')
        }
    }

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <TopBar title="Payment Tracking" subtitle="Record settlements between members" />

                <div className="content-section active">
                    <div className="widget">
                        <div className="widget-header">
                            <h3>💸 Payment History</h3>
                            {isAdmin && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (showForm && !editingPayment) {
                                            setShowForm(false)
                                        } else if (showForm && editingPayment) {
                                            handleCancelEdit()
                                        } else {
                                            setShowForm(true)
                                        }
                                    }}
                                >
                                    {showForm ? 'Cancel' : '+ Record Payment'}
                                </button>
                            )}
                        </div>

                        {!isAdmin && (
                            <div style={{
                                padding: '1rem 1.5rem',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                color: 'white',
                                margin: '1rem 0',
                                borderRadius: '12px',
                                fontWeight: '600',
                                textAlign: 'center',
                                boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
                            }}>
                                🔒 Read-Only Mode - Login as admin to record payments
                            </div>
                        )}

                        {showForm && (
                            <div className="form-card" style={{ marginBottom: '2rem' }}>
                                <div className="card-body">
                                    <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                                        {editingPayment ? '✏️ Edit Payment' : '➕ New Payment'}
                                    </h4>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>From (Payer)</label>
                                                <select
                                                    value={formData.from}
                                                    onChange={e => setFormData({ ...formData, from: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select Member</option>
                                                    {members.map(m => (
                                                        <option key={m.id} value={m.name}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>To (Receiver)</label>
                                                <select
                                                    value={formData.to}
                                                    onChange={e => setFormData({ ...formData, to: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select Member</option>
                                                    {members.map(m => (
                                                        <option key={m.id} value={m.name}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={formData.amount}
                                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Note (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Add a note about this payment..."
                                                value={formData.note}
                                                onChange={e => setFormData({ ...formData, note: e.target.value })}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-success">
                                            {editingPayment ? '💾 Update Payment' : '✅ Record Payment'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="payments-list">
                            {loading ? (
                                <div className="loading">Loading payments...</div>
                            ) : payments.length === 0 ? (
                                <div className="no-data">No payments recorded</div>
                            ) : (
                                payments.map(payment => (
                                    <div key={payment.id} className="payment-item" style={{
                                        padding: '1.2rem',
                                        borderBottom: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease',
                                        borderLeft: '4px solid var(--secondary-color)',
                                        background: 'white',
                                        borderRadius: '8px',
                                        marginBottom: '0.8rem'
                                    }}>
                                        <div className="payment-info" style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                                                {payment.from_user} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>paid</span> {payment.to_user}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                                                📅 {new Date(payment.date).toLocaleDateString('en-US', { 
                                                    day: 'numeric',
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                })}
                                            </div>
                                            {payment.note && (
                                                <div style={{ 
                                                    fontSize: '0.9rem', 
                                                    color: 'var(--text-secondary)', 
                                                    fontStyle: 'italic',
                                                    marginTop: '0.5rem',
                                                    padding: '0.5rem',
                                                    background: '#f8f9fa',
                                                    borderRadius: '8px',
                                                    borderLeft: '3px solid var(--primary-color)'
                                                }}>
                                                    📝 {payment.note}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div className="payment-amount" style={{ 
                                                fontWeight: 'bold', 
                                                color: 'var(--secondary-color)',
                                                fontSize: '1.3rem'
                                            }}>
                                                ₹{payment.amount.toFixed(2)}
                                            </div>
                                            {isAdmin && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleEdit(payment)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)'
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)'
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)'
                                                        }}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(payment.id)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)'
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)'
                                                        }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)'
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.3)'
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                            )}
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
