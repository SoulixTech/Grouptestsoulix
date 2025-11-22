'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSync } from '../contexts/SyncContext'

export default function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const { isAdmin, login, logout } = useAuth()
    const { syncStatus, lastSyncTime } = useSync()
    const [showLogin, setShowLogin] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const navItems = [
        { href: '/dashboard', icon: '📊', text: 'Dashboard' },
        { href: '/quick-split', icon: '🧮', text: 'Quick Split' },
        { href: '/add-expense', icon: '➕', text: 'Add Expense' },
        { href: '/expenses', icon: '📜', text: 'All Expenses' },
        { href: '/transactions', icon: '📋', text: 'Transactions' },
        { href: '/balances', icon: '💵', text: 'Balances' },
        { href: '/settlements', icon: '💳', text: 'Settlements' },
        { href: '/payments', icon: '💸', text: 'Payments' },
        { href: '/members', icon: '👥', text: 'Members' },
    ]

    const closeSidebar = () => setIsOpen(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoggingIn(true)
        setError('')
        
        const success = await login(username, password)
        
        setIsLoggingIn(false)
        
        if (success) {
            setShowLogin(false)
            setUsername('')
            setPassword('')
            setError('')
            
            // Show success notification
            const notification = document.createElement('div')
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.7);
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 2rem 3rem;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4);
                z-index: 10000;
                font-size: 1.2rem;
                font-weight: 600;
                text-align: center;
                animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
            `
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem;">🔓</div>
                    <span>Welcome ${username}!</span>
                </div>
            `
            document.body.appendChild(notification)
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.3s ease forwards'
                setTimeout(() => notification.remove(), 300)
            }, 1500)
        } else {
            setError('Invalid username or password')
            setPassword('')
        }
    }

    const handleLogout = () => {
        logout()
        closeSidebar()
        
        // Show logout notification
        const notification = document.createElement('div')
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.7);
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 2rem 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(245, 158, 11, 0.4);
            z-index: 10000;
            font-size: 1.2rem;
            font-weight: 600;
            text-align: center;
            animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        `
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 2rem;">🔒</div>
                <span>Logged Out - Read Only Mode</span>
            </div>
        `
        document.body.appendChild(notification)
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards'
            setTimeout(() => notification.remove(), 300)
        }, 1500)
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button 
                className="mobile-menu-btn" 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="sidebar-backdrop" 
                    onClick={closeSidebar}
                ></div>
            )}

            <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">💰</div>
                        <div className="logo-text">
                            <h2>BillBuddy</h2>
                            <p>Expense Tracker</p>
                        </div>
                    </div>
                    <button 
                        className="sidebar-close-btn"
                        onClick={closeSidebar}
                    >
                        ✕
                    </button>
                </div>

                <div className="nav-menu">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.text}</span>
                        </Link>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <div className="admin-section">
                        {!isAdmin ? (
                            <button
                                onClick={() => setShowLogin(true)}
                                className="admin-login-btn"
                            >
                                🔒 Admin Login
                            </button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="admin-logout-btn"
                            >
                                🔓 Logout
                            </button>
                        )}
                    </div>
                    <div className={`sync-status-sidebar ${syncStatus}`}>
                        <span className="sync-indicator">
                            {syncStatus === 'syncing' ? '🔄' : syncStatus === 'synced' ? '✓' : '⚠️'}
                        </span>
                        <span className="sync-text">
                            {syncStatus === 'syncing' ? 'Syncing...' : 
                             syncStatus === 'synced' ? 'Synced' : 
                             'Sync Error'}
                        </span>
                    </div>
                </div>
            </nav>

            {/* Login Modal */}
            {showLogin && (
                <div className="modal-overlay" onClick={() => setShowLogin(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>🔐 Admin Login</h2>
                        <p>Enter admin credentials to enable editing</p>
                        
                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value)
                                    setError('')
                                }}
                                placeholder="Username"
                                autoFocus
                                disabled={isLoggingIn}
                                className="password-input"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setError('')
                                }}
                                placeholder="Password"
                                disabled={isLoggingIn}
                                className="password-input"
                            />
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="button-group">
                                <button type="submit" className="btn-login" disabled={isLoggingIn}>
                                    {isLoggingIn ? 'Logging in...' : 'Login'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowLogin(false)
                                        setUsername('')
                                        setPassword('')
                                        setError('')
                                    }}
                                    className="btn-cancel"
                                    disabled={isLoggingIn}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .admin-section {
                    margin-bottom: 1rem;
                }

                .admin-login-btn,
                .admin-logout-btn {
                    width: 100%;
                    padding: 12px 20px;
                    border-radius: 12px;
                    border: none;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .admin-login-btn {
                    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
                }

                .admin-logout-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                }

                .admin-login-btn:hover,
                .admin-logout-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }

                .admin-modal {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease;
                }

                .admin-modal h2 {
                    margin: 0 0 0.5rem 0;
                    color: #1e293b;
                    font-size: 1.5rem;
                }

                .admin-modal p {
                    margin: 0 0 1.5rem 0;
                    color: #64748b;
                    font-size: 0.95rem;
                }

                .password-input {
                    width: 100%;
                    padding: 14px 18px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 16px;
                    margin-bottom: 1rem;
                    transition: border-color 0.3s;
                    box-sizing: border-box;
                }

                .password-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .error-message {
                    color: #dc2626;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                    padding: 0.5rem;
                    background: #fee2e2;
                    border-radius: 8px;
                }

                .button-group {
                    display: flex;
                    gap: 1rem;
                }

                .btn-login,
                .btn-cancel {
                    flex: 1;
                    padding: 14px;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-login {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .btn-login:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
                }

                .btn-cancel {
                    background: #f1f5f9;
                    color: #475569;
                }

                .btn-cancel:hover {
                    background: #e2e8f0;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
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

                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                .sidebar-backdrop {
                    display: none;
                }

                .sidebar-close-btn {
                    display: none;
                }

                @media (max-width: 1024px) {
                    .sidebar-backdrop {
                        display: block;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 999;
                        animation: fadeIn 0.3s ease;
                    }

                    .sidebar-close-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        font-size: 24px;
                        width: 40px;
                        height: 40px;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .sidebar-close-btn:hover {
                        background: rgba(255, 255, 255, 0.3);
                    }
                }
            `}</style>
        </>
    )
}
