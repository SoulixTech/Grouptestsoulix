'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import ConfirmDialog from '../../components/ConfirmDialog'
import AIChatbot from '../../components/AIChatbot'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function ExpensesPage() {
    const { isAdmin } = useAuth()
    const [expenses, setExpenses] = useState([])
    const [members, setMembers] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterCategory, setFilterCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedExpense, setSelectedExpense] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({})
    const [mounted, setMounted] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, expenseId: null, expenseData: null })

    useEffect(() => {
        setMounted(true)
        fetchExpenses()
        fetchMembers()
        fetchPayments()
    }, [])

    const fetchPayments = async () => {
        try {
            const { data } = await supabase
                .from('payments')
                .select('*')
            setPayments(data || [])
        } catch (error) {
            console.error('Error fetching payments:', error)
        }
    }

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('name')

            if (error) throw error
            setMembers(data || [])
        } catch (error) {
            console.error('Error fetching members:', error)
        }
    }

    const fetchExpenses = async () => {
        try {
            console.log('Fetching expenses from Supabase...')
            setLoading(true)
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false })

            console.log('Fetch result:', { data, error })
            if (error) {
                console.error('Supabase error:', error)
                throw error
            }
            console.log('Setting expenses:', data)
            setExpenses(data || [])
        } catch (error) {
            console.error('Error fetching expenses:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteExpense = async (id, e) => {
        e.stopPropagation() // Prevent opening detail modal
        const expense = expenses.find(exp => exp.id === id)
        setDeleteConfirm({ 
            isOpen: true, 
            expenseId: id,
            expenseData: expense
        })
    }

    const confirmDelete = async () => {
        const { expenseId } = deleteConfirm
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expenseId)

            if (error) throw error
            setExpenses(expenses.filter(exp => exp.id !== expenseId))
            if (selectedExpense?.id === expenseId) {
                setSelectedExpense(null)
            }
            setDeleteConfirm({ isOpen: false, expenseId: null, expenseData: null })
            // Success notification
            const notification = document.createElement('div')
            notification.className = 'success-notification'
            notification.textContent = '✅ Expense deleted successfully!'
            document.body.appendChild(notification)
            setTimeout(() => notification.remove(), 3000)
        } catch (error) {
            console.error('Error deleting expense:', error)
            alert('Error deleting expense: ' + error.message)
            setDeleteConfirm({ isOpen: false, expenseId: null, expenseData: null })
        }
    }

    const openDetailModal = (expense) => {
        setSelectedExpense(expense)
        setEditForm({
            description: expense.description,
            amount: expense.amount,
            paid_by: expense.paid_by,
            date: expense.date,
            category: expense.category,
            notes: expense.notes || '',
            involved: expense.involved || []
        })
        setIsEditing(false)
    }

    const closeModal = () => {
        setSelectedExpense(null)
        setIsEditing(false)
        setEditForm({})
    }

    const showSuccessNotification = (message) => {
        const notification = document.createElement('div')
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.7);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2.5rem 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
            z-index: 10000;
            font-size: 1.2rem;
            font-weight: 600;
            text-align: center;
            animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
            min-width: 300px;
        `
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; justify-content: center;">
                <div style="
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: bounce 0.6s ease;
                ">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span>${message}</span>
            </div>
        `
        
        document.body.appendChild(notification)
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards'
            setTimeout(() => notification.remove(), 300)
        }, 1300)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        try {
            const { error } = await supabase
                .from('expenses')
                .update({
                    description: editForm.description,
                    amount: parseFloat(editForm.amount),
                    paid_by: editForm.paid_by,
                    date: editForm.date,
                    category: editForm.category,
                    notes: editForm.notes,
                    involved: editForm.involved
                })
                .eq('id', selectedExpense.id)

            if (error) throw error

            // Update local state
            setExpenses(expenses.map(exp =>
                exp.id === selectedExpense.id
                    ? { ...exp, ...editForm, amount: parseFloat(editForm.amount) }
                    : exp
            ))
            setSelectedExpense({ ...selectedExpense, ...editForm, amount: parseFloat(editForm.amount) })
            setIsEditing(false)
            showSuccessNotification('Expense updated successfully!')
        } catch (error) {
            console.error('Error updating expense:', error)
            alert('Error updating expense: ' + error.message)
        }
    }

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = filterCategory === 'all' || expense.category === filterCategory

        return matchesSearch && matchesCategory
    })

    if (!mounted) return null

    return (
        <>
            <Sidebar />
            <AIChatbot expenses={expenses} members={members} payments={payments} />
            <div className="main-content">
                <TopBar title="All Expenses" subtitle="View and manage expense history" />

                <div className="content-section active">
                    <div className="widget">
                        <div className="widget-header">
                            <h3>📜 Expense History</h3>
                            <div className="filter-controls">
                                <input
                                    type="text"
                                    placeholder="🔍 Search..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <select
                                    className="filter-select"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    <option value="Food & Drinks">🍔 Food & Drinks</option>
                                    <option value="Transportation">🚗 Transportation</option>
                                    <option value="Entertainment">🎉 Entertainment</option>
                                    <option value="Birthday Party">🎂 Birthday Party</option>
                                    <option value="Night Out">🌙 Night Out</option>
                                    <option value="Other">📌 Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="expense-list">
                            {loading ? (
                                <div className="loading">Loading expenses...</div>
                            ) : filteredExpenses.length === 0 ? (
                                <div className="no-data">No expenses found</div>
                            ) : (
                                filteredExpenses.map(expense => (
                                    <div
                                        key={expense.id}
                                        className="expense-item"
                                        onClick={() => openDetailModal(expense)}
                                        style={{ 
                                            cursor: 'pointer',
                                            borderLeft: expense.is_expensive ? '5px solid #ff6b6b' : expense.category === 'Reimbursement' ? '5px solid #667eea' : '4px solid #e0e0e0',
                                            background: expense.is_expensive ? 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)' : 'white'
                                        }}
                                    >
                                        <div className="expense-header">
                                            <div className="expense-main-info">
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <span className="expense-title">{expense.description}</span>
                                                        {expense.is_expensive && (
                                                            <span style={{
                                                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                                                                color: 'white',
                                                                padding: '0.2rem 0.6rem',
                                                                borderRadius: '12px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '700',
                                                                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                                                            }}>
                                                                💰 EXPENSIVE
                                                            </span>
                                                        )}
                                                        {expense.category === 'Reimbursement' && (
                                                            <span style={{
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                color: 'white',
                                                                padding: '0.2rem 0.6rem',
                                                                borderRadius: '12px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '700',
                                                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                                            }}>
                                                                💰 REIMBURSEMENT
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="expense-category">{expense.category}</span>
                                                </div>
                                                <div className="expense-details">
                                                    <div className="expense-detail">
                                                        <strong>📅 Date:</strong> {new Date(expense.date).toLocaleDateString('en-US', { 
                                                            day: 'numeric',
                                                            month: 'short', 
                                                            year: 'numeric' 
                                                        })}
                                                    </div>
                                                    <div className="expense-detail">
                                                        <strong>💳 Paid by:</strong> {expense.paid_by}
                                                    </div>
                                                    <div className="expense-detail">
                                                        <strong>👥 {expense.category === 'Reimbursement' ? 'Owes full amount:' : 'Split:'}</strong> {expense.involved?.length || 0} {expense.category === 'Reimbursement' ? 'person' : 'people'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className="expense-amount">₹{expense.amount.toFixed(2)}</div>
                                                {isAdmin && (
                                                    <div className="expense-actions">
                                                        <button
                                                            className="delete-expense"
                                                            onClick={(e) => deleteExpense(expense.id, e)}
                                                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '14px', padding: '5px 10px' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail/Edit Modal */}
            {selectedExpense && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <div className="modal-icon">
                                    {isEditing ? '✏️' : '📋'}
                                </div>
                                <h2>{isEditing ? 'Edit Expense' : 'Expense Details'}</h2>
                            </div>
                            <button className="close-modal" onClick={closeModal}>✕</button>
                        </div>

                        {!isEditing ? (
                            <div className="expense-detail-view">
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <span className="detail-label">Description</span>
                                    </div>
                                    <div className="detail-value description-value">
                                        {selectedExpense.description}
                                    </div>
                                </div>

                                <div className="detail-card amount-card">
                                    <div className="detail-header">
                                        <span className="detail-label">Amount</span>
                                    </div>
                                    <div className="detail-value amount-highlight">
                                        ₹{selectedExpense.amount.toFixed(2)}
                                    </div>
                                </div>

                                <div className="detail-grid">
                                    <div className="detail-card">
                                        <div className="detail-header">
                                            <span className="detail-label">Category</span>
                                        </div>
                                        <div className="detail-value">
                                            <span className="category-badge">{selectedExpense.category}</span>
                                        </div>
                                    </div>

                                    <div className="detail-card">
                                        <div className="detail-header">
                                            <span className="detail-label">Date</span>
                                        </div>
                                        <div className="detail-value">
                                            📅 {new Date(selectedExpense.date).toLocaleDateString('en-US', { 
                                                weekday: 'short', 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <div className="detail-header">
                                        <span className="detail-label">Paid by</span>
                                    </div>
                                    <div className="detail-value">
                                        <div className="paid-by-badge">
                                            <span className="user-icon">👤</span>
                                            {selectedExpense.paid_by}
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <div className="detail-header">
                                        <span className="detail-label">Split among</span>
                                        <span className="people-count">{selectedExpense.involved?.length || 0} people</span>
                                    </div>
                                    <div className="detail-value">
                                        <div className="split-people-list">
                                            {selectedExpense.involved?.map((person, idx) => (
                                                <div key={idx} className="person-chip">
                                                    <span className="chip-icon">👥</span>
                                                    {person}
                                                </div>
                                            )) || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {selectedExpense.notes && (
                                    <div className="detail-card notes-card">
                                        <div className="detail-header">
                                            <span className="detail-label">📝 Notes</span>
                                        </div>
                                        <div className="detail-value notes-value">
                                            {selectedExpense.notes}
                                        </div>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    {isAdmin && (
                                        <>
                                            <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                                <span className="btn-icon">✏️</span>
                                                <span>Edit</span>
                                            </button>
                                            <button className="btn-delete" onClick={(e) => deleteExpense(selectedExpense.id, e)}>
                                                <span className="btn-icon">🗑️</span>
                                                <span>Delete</span>
                                            </button>
                                        </>
                                    )}
                                    {!isAdmin && (
                                        <div style={{
                                            padding: '0.8rem',
                                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            textAlign: 'center'
                                        }}>
                                            🔒 Login as admin to edit or delete
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleEditSubmit} className="expense-edit-form">
                                <div className="form-group">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        required
                                        placeholder="Enter expense description"
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Amount (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.amount}
                                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                            required
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            required
                                        >
                                            <option value="Food & Drinks">🍔 Food & Drinks</option>
                                            <option value="Transportation">🚗 Transportation</option>
                                            <option value="Entertainment">🎉 Entertainment</option>
                                            <option value="Birthday Party">🎂 Birthday Party</option>
                                            <option value="Night Out">🌙 Night Out</option>
                                            <option value="Other">📌 Other</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={editForm.date}
                                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Paid by</label>
                                        <select
                                            value={editForm.paid_by}
                                            onChange={(e) => setEditForm({ ...editForm, paid_by: e.target.value })}
                                            required
                                        >
                                            {members.map(member => (
                                                <option key={member.id} value={member.name}>{member.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>👥 Split Between</label>
                                    <div className="members-grid">
                                        {members.map(member => (
                                            <div
                                                key={member.id}
                                                className={`member-chip ${editForm.involved?.includes(member.name) ? 'selected' : ''}`}
                                                onClick={() => {
                                                    const currentInvolved = editForm.involved || []
                                                    const newInvolved = currentInvolved.includes(member.name)
                                                        ? currentInvolved.filter(m => m !== member.name)
                                                        : [...currentInvolved, member.name]
                                                    setEditForm({ ...editForm, involved: newInvolved })
                                                }}
                                            >
                                                <div className="member-avatar">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="member-name">{member.name}</span>
                                                {editForm.involved?.includes(member.name) && (
                                                    <span className="check-icon">✓</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Notes (Optional)</label>
                                    <textarea
                                        value={editForm.notes}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        rows="3"
                                        placeholder="Add any additional notes..."
                                    />
                                </div>
                                
                                <div className="modal-actions">
                                    <button type="submit" className="btn-primary">
                                        <span className="btn-icon">💾</span>
                                        <span>Save Changes</span>
                                    </button>
                                    <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                                        <span className="btn-icon">✕</span>
                                        <span>Cancel</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, expenseId: null, expenseData: null })}
                onConfirm={confirmDelete}
                title="Delete Expense?"
                message={deleteConfirm.expenseData 
                    ? `Are you sure you want to delete "${deleteConfirm.expenseData.description}" (₹${deleteConfirm.expenseData.amount.toFixed(2)})? This action cannot be undone.`
                    : "Are you sure you want to delete this expense?"}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal-content {
                    background: white;
                    border-radius: 24px;
                    padding: 0;
                    max-width: 680px;
                    width: 92%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px) scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                .modal-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 32px;
                    border-radius: 24px 24px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                }

                .modal-header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -10%;
                    width: 200px;
                    height: 200px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                }

                .modal-header-content {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .modal-icon {
                    width: 56px;
                    height: 56px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
                }

                .modal-header h2 {
                    margin: 0;
                    color: white;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .close-modal {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    font-size: 24px;
                    cursor: pointer;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    z-index: 1;
                }

                .close-modal:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: rotate(90deg);
                }

                .expense-detail-view {
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .detail-card {
                    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                    transition: all 0.3s ease;
                }

                .detail-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.12);
                }

                .amount-card {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                }

                .notes-card {
                    background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
                    border: 1px solid #ffd700;
                }

                .detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .detail-label {
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #64748b;
                }

                .amount-card .detail-label {
                    color: rgba(255, 255, 255, 0.9);
                }

                .people-count {
                    background: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .detail-value {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .description-value {
                    font-size: 24px;
                    color: #2c3e50;
                    line-height: 1.4;
                }

                .amount-highlight {
                    font-size: 42px;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -1px;
                }

                .category-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 30px;
                    font-size: 15px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .paid-by-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 30px;
                    font-size: 16px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .user-icon {
                    font-size: 20px;
                }

                .split-people-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .person-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    border: 2px solid #e2e8f0;
                    padding: 8px 16px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #475569;
                    transition: all 0.2s ease;
                }

                .person-chip:hover {
                    border-color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
                }

                .chip-icon {
                    font-size: 16px;
                }

                .notes-value {
                    color: #92400e;
                    font-size: 16px;
                    line-height: 1.6;
                    font-weight: 500;
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 12px;
                }

                .btn-edit,
                .btn-delete {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 16px 24px;
                    border: none;
                    border-radius: 14px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .btn-edit {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .btn-edit:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
                }

                .btn-delete {
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
                }

                .btn-delete:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.5);
                }

                .btn-edit:active,
                .btn-delete:active {
                    transform: translateY(-1px);
                }

                .btn-icon {
                    font-size: 20px;
                }

                @media (max-width: 640px) {
                    .modal-content {
                        width: 95%;
                        border-radius: 20px;
                    }

                    .modal-header {
                        padding: 24px;
                    }

                    .modal-header h2 {
                        font-size: 22px;
                    }

                    .modal-icon {
                        width: 48px;
                        height: 48px;
                        font-size: 24px;
                    }

                    .expense-detail-view {
                        padding: 24px;
                    }

                    .detail-grid {
                        grid-template-columns: 1fr;
                    }

                    .amount-highlight {
                        font-size: 32px;
                    }

                    .description-value {
                        font-size: 20px;
                    }

                    .modal-actions {
                        flex-direction: column;
                    }

                    .btn-edit,
                    .btn-delete {
                        width: 100%;
                    }
                }

                .expense-edit-form {
                    padding: 32px;
                }

                .form-group {
                    margin-bottom: 24px;
                }

                .form-group label {
                    display: block;
                    font-weight: 600;
                    font-size: 14px;
                    color: #1e293b;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 14px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    font-family: inherit;
                    background: white;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .members-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 12px;
                    margin-top: 12px;
                }

                .member-chip {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    user-select: none;
                }

                .member-chip:hover {
                    border-color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
                }

                .member-chip.selected {
                    border-color: #667eea;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .member-chip.selected:hover {
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
                }

                .member-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
                    color: white;
                    flex-shrink: 0;
                }

                .member-chip.selected .member-avatar {
                    background: rgba(255, 255, 255, 0.25);
                }

                .member-name {
                    flex: 1;
                    font-weight: 600;
                    font-size: 14px;
                }

                .check-icon {
                    font-size: 18px;
                    font-weight: bold;
                    color: white;
                    animation: checkPop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                @keyframes checkPop {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }

                .btn-primary,
                .btn-secondary {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 16px 32px;
                    border: none;
                    border-radius: 14px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    flex: 1;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                }

                .btn-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
                }

                .btn-secondary {
                    background: white;
                    color: #475569;
                    border: 2px solid #e2e8f0;
                }

                .btn-secondary:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    transform: translateY(-2px);
                }

                .btn-primary:active,
                .btn-secondary:active {
                    transform: translateY(0);
                }
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .success-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
                    color: white;
                    padding: 16px 24px;
                    border-radius: 12px;
                    box-shadow: 0 8px 25px rgba(86, 171, 47, 0.4);
                    font-size: 16px;
                    font-weight: 600;
                    z-index: 10001;
                    animation: slideInRight 0.4s ease-out, fadeOut 0.5s ease-in 2.5s;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }

                @keyframes popIn {
                    0% {
                        transform: translate(-50%, -50%) scale(0.7);
                        opacity: 0;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </>
    )
}
