'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLogin() {
    const [password, setPassword] = useState('')
    const [showLogin, setShowLogin] = useState(false)
    const [error, setError] = useState('')
    const { isAdmin, login, logout } = useAuth()

    const handleLogin = (e) => {
        e.preventDefault()
        const success = login(password)
        
        if (success) {
            setShowLogin(false)
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
                    <span>Admin Access Granted!</span>
                </div>
            `
            document.body.appendChild(notification)
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.3s ease forwards'
                setTimeout(() => notification.remove(), 300)
            }, 1500)
        } else {
            setError('Invalid password')
            setPassword('')
        }
    }

    const handleLogout = () => {
        logout()
        
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

            {showLogin && (
                <div className="modal-overlay" onClick={() => setShowLogin(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>🔐 Admin Login</h2>
                        <p>Enter admin password to enable editing</p>
                        
                        <form onSubmit={handleLogin}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setError('')
                                }}
                                placeholder="Enter password"
                                autoFocus
                                className="password-input"
                            />
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="button-group">
                                <button type="submit" className="btn-login">
                                    Login
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowLogin(false)
                                        setPassword('')
                                        setError('')
                                    }}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .admin-login-btn,
                .admin-logout-btn {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 24px;
                    border-radius: 12px;
                    border: none;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    z-index: 999;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .admin-login-btn {
                    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
                    color: white;
                }

                .admin-logout-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                }

                .admin-login-btn:hover,
                .admin-logout-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
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

                @media (max-width: 768px) {
                    .admin-login-btn,
                    .admin-logout-btn {
                        top: 10px;
                        right: 10px;
                        padding: 10px 18px;
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    )
}
