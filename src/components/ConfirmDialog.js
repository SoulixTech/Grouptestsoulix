'use client'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "OK", cancelText = "Cancel", type = "danger" }) {
    if (!isOpen) return null

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                    shadow: 'rgba(255, 107, 107, 0.4)',
                    icon: '⚠️'
                }
            case 'warning':
                return {
                    gradient: 'linear-gradient(135deg, #ffa502 0%, #ff7f50 100%)',
                    shadow: 'rgba(255, 165, 2, 0.4)',
                    icon: '⚡'
                }
            case 'info':
                return {
                    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    shadow: 'rgba(102, 126, 234, 0.4)',
                    icon: 'ℹ️'
                }
            default:
                return {
                    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    shadow: 'rgba(102, 126, 234, 0.4)',
                    icon: '💬'
                }
        }
    }

    const styles = getTypeStyles()

    return (
        <>
            <div className="confirm-overlay" onClick={onClose}>
                <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="confirm-icon-wrapper">
                        <div className="confirm-icon" style={{ background: styles.gradient }}>
                            <span>{styles.icon}</span>
                        </div>
                    </div>
                    
                    <div className="confirm-content">
                        <h3 className="confirm-title">{title}</h3>
                        <p className="confirm-message">{message}</p>
                    </div>

                    <div className="confirm-actions">
                        <button 
                            className="confirm-btn confirm-btn-primary"
                            onClick={onConfirm}
                            style={{ 
                                background: styles.gradient,
                                boxShadow: `0 4px 15px ${styles.shadow}`
                            }}
                        >
                            {confirmText}
                        </button>
                        <button 
                            className="confirm-btn confirm-btn-secondary"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .confirm-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.2s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .confirm-dialog {
                    background: white;
                    border-radius: 24px;
                    padding: 40px 35px 30px;
                    max-width: 460px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease-out;
                    position: relative;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(30px) scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                .confirm-icon-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 25px;
                }

                .confirm-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    animation: bounceIn 0.5s ease-out;
                }

                @keyframes bounceIn {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                .confirm-content {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .confirm-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #2c3e50;
                    margin: 0 0 15px 0;
                    letter-spacing: -0.5px;
                }

                .confirm-message {
                    font-size: 16px;
                    color: #5a6c7d;
                    margin: 0;
                    line-height: 1.6;
                }

                .confirm-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .confirm-btn {
                    flex: 1;
                    padding: 14px 28px;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-transform: capitalize;
                    letter-spacing: 0.3px;
                    position: relative;
                    overflow: hidden;
                }

                .confirm-btn::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                .confirm-btn:hover::before {
                    width: 300px;
                    height: 300px;
                }

                .confirm-btn-primary {
                    color: white;
                    position: relative;
                }

                .confirm-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
                }

                .confirm-btn-primary:active {
                    transform: translateY(0);
                }

                .confirm-btn-secondary {
                    background: #e8ecef;
                    color: #5a6c7d;
                    border: 2px solid #d1d8dd;
                }

                .confirm-btn-secondary:hover {
                    background: #d1d8dd;
                    border-color: #b8c1c8;
                    transform: translateY(-1px);
                }

                .confirm-btn-secondary:active {
                    transform: translateY(0);
                }

                @media (max-width: 480px) {
                    .confirm-dialog {
                        padding: 30px 25px 25px;
                        border-radius: 20px;
                    }

                    .confirm-icon {
                        width: 65px;
                        height: 65px;
                        font-size: 32px;
                    }

                    .confirm-title {
                        font-size: 20px;
                    }

                    .confirm-message {
                        font-size: 14px;
                    }

                    .confirm-actions {
                        flex-direction: column-reverse;
                    }

                    .confirm-btn {
                        padding: 12px 24px;
                        font-size: 15px;
                    }
                }
            `}</style>
        </>
    )
}
