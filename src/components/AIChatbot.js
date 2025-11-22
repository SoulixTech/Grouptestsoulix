'use client'

import { useState, useRef, useEffect } from 'react'

export default function AIChatbot({ expenses = [], members = [], payments = [] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            text: '👋 Hi! I\'m your expense assistant. Ask me anything about your expenses, balances, or statistics!'
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const analyzeQuestion = (question) => {
        const q = question.toLowerCase()

        // Calculate balances
        const balances = {}
        members.forEach(member => {
            balances[member.name] = 0
        })

        expenses.forEach(expense => {
            if (balances[expense.paid_by] !== undefined) {
                balances[expense.paid_by] += expense.amount
            }
            
            if (expense.involved && expense.involved.length > 0) {
                if (expense.split_details) {
                    Object.entries(expense.split_details).forEach(([member, splitAmount]) => {
                        if (balances[member] !== undefined) {
                            balances[member] -= splitAmount
                        }
                    })
                } else {
                    const splitAmount = expense.amount / expense.involved.length
                    expense.involved.forEach(member => {
                        if (balances[member] !== undefined) {
                            balances[member] -= splitAmount
                        }
                    })
                }
            }
        })

        if (payments) {
            payments.forEach(payment => {
                if (balances[payment.from_user] !== undefined) {
                    balances[payment.from_user] += payment.amount
                }
                if (balances[payment.to_user] !== undefined) {
                    balances[payment.to_user] -= payment.amount
                }
            })
        }

        // Total expenses
        if (q.includes('total expense') || q.includes('how much spent') || q.includes('total spent')) {
            const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
            return `💰 The total expenses amount to ₹${total.toFixed(2)}. This includes ${expenses.length} transactions.`
        }

        // Member specific balance
        const memberMatch = members.find(m => q.includes(m.name.toLowerCase()))
        if (memberMatch && (q.includes('balance') || q.includes('owe') || q.includes('debt'))) {
            const balance = balances[memberMatch.name] || 0
            if (balance > 0.01) {
                return `💵 ${memberMatch.name} is owed ₹${balance.toFixed(2)} by the group.`
            } else if (balance < -0.01) {
                return `💳 ${memberMatch.name} owes ₹${Math.abs(balance).toFixed(2)} to the group.`
            } else {
                return `✅ ${memberMatch.name} is all settled up! No pending balances.`
            }
        }

        // Who owes whom
        if (q.includes('who owes') || q.includes('settlements')) {
            const debtors = Object.entries(balances)
                .filter(([_, balance]) => balance < -0.01)
                .map(([name, balance]) => `${name} owes ₹${Math.abs(balance).toFixed(2)}`)
            
            const creditors = Object.entries(balances)
                .filter(([_, balance]) => balance > 0.01)
                .map(([name, balance]) => `${name} is owed ₹${balance.toFixed(2)}`)

            if (debtors.length === 0) {
                return '✅ Everyone is settled up! No pending settlements.'
            }

            return `📊 Current settlements:\n\n${debtors.join('\n')}\n\n${creditors.join('\n')}`
        }

        // Category breakdown
        if (q.includes('category') || q.includes('categories')) {
            const categories = {}
            expenses.forEach(exp => {
                const cat = exp.category || 'Uncategorized'
                categories[cat] = (categories[cat] || 0) + exp.amount
            })
            
            const breakdown = Object.entries(categories)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)}`)
                .join('\n')
            
            return `📁 Expense breakdown by category:\n\n${breakdown}`
        }

        // Recent expenses
        if (q.includes('recent') || q.includes('latest')) {
            const recent = expenses.slice(0, 5)
            const list = recent.map(exp => 
                `• ${exp.description} - ₹${exp.amount.toFixed(2)} (paid by ${exp.paid_by})`
            ).join('\n')
            
            return `📝 Recent expenses:\n\n${list}`
        }

        // Highest expense
        if (q.includes('highest') || q.includes('biggest') || q.includes('largest')) {
            if (expenses.length === 0) return '📭 No expenses found.'
            const highest = expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max, expenses[0])
            return `🔝 Highest expense: ${highest.description} - ₹${highest.amount.toFixed(2)} paid by ${highest.paid_by} on ${new Date(highest.date).toLocaleDateString()}`
        }

        // Average expense
        if (q.includes('average') || q.includes('avg')) {
            const avg = expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length
            return `📊 Average expense: ₹${avg.toFixed(2)} (across ${expenses.length} transactions)`
        }

        // Who paid most
        if (q.includes('who paid most') || q.includes('biggest payer')) {
            const payers = {}
            expenses.forEach(exp => {
                payers[exp.paid_by] = (payers[exp.paid_by] || 0) + exp.amount
            })
            
            const topPayer = Object.entries(payers)
                .sort((a, b) => b[1] - a[1])[0]
            
            return `👑 ${topPayer[0]} paid the most with ₹${topPayer[1].toFixed(2)} across ${expenses.filter(e => e.paid_by === topPayer[0]).length} expenses.`
        }

        // Count expenses
        if (q.includes('how many expense')) {
            return `📊 There are ${expenses.length} expenses recorded in total.`
        }

        // Help/capabilities
        if (q.includes('help') || q.includes('what can you')) {
            return `🤖 I can help you with:\n\n• Total expenses & statistics\n• Individual balances\n• Settlement information\n• Category breakdowns\n• Recent transactions\n• Highest/lowest expenses\n• Who paid most\n\nJust ask me in plain English!`
        }

        // Default response
        return `🤔 I'm not sure about that. Try asking about:\n\n• "What's the total expense?"\n• "What's [name]'s balance?"\n• "Who owes whom?"\n• "Show category breakdown"\n• "What are recent expenses?"\n• "Who paid the most?"\n\nOr type "help" for more options!`
    }

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = { type: 'user', text: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        // Simulate thinking time
        setTimeout(() => {
            const response = analyzeQuestion(input)
            setMessages(prev => [...prev, { type: 'ai', text: response }])
            setIsTyping(false)
        }, 500)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="chat-toggle-btn"
            >
                {isOpen ? '✕' : '🤖'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-content">
                            <div className="ai-avatar">🤖</div>
                            <div>
                                <h3>AI Assistant</h3>
                                <p>Ask me about your expenses</p>
                            </div>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.type}`}>
                                <div className="message-bubble">
                                    {msg.text.split('\n').map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message ai">
                                <div className="message-bubble typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything..."
                            className="chat-input"
                        />
                        <button onClick={handleSend} className="send-btn">
                            ➤
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .chat-toggle-btn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    font-size: 28px;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                    z-index: 1000;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chat-toggle-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
                }

                .chat-window {
                    position: fixed;
                    bottom: 110px;
                    right: 30px;
                    width: 400px;
                    height: 600px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.3s ease;
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

                .chat-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                }

                .chat-header-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .ai-avatar {
                    width: 45px;
                    height: 45px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .chat-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                }

                .chat-header p {
                    margin: 4px 0 0 0;
                    font-size: 13px;
                    opacity: 0.9;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    background: #f8f9fa;
                }

                .message {
                    margin-bottom: 16px;
                    display: flex;
                }

                .message.ai {
                    justify-content: flex-start;
                }

                .message.user {
                    justify-content: flex-end;
                }

                .message-bubble {
                    max-width: 75%;
                    padding: 12px 16px;
                    border-radius: 16px;
                    line-height: 1.5;
                    white-space: pre-line;
                }

                .message.ai .message-bubble {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-bottom-left-radius: 4px;
                }

                .message.user .message-bubble {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message-bubble.typing {
                    display: flex;
                    gap: 6px;
                    padding: 16px;
                }

                .message-bubble.typing span {
                    width: 8px;
                    height: 8px;
                    background: #cbd5e1;
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }

                .message-bubble.typing span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .message-bubble.typing span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-10px);
                    }
                }

                .chat-input-area {
                    padding: 16px;
                    background: white;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    gap: 12px;
                }

                .chat-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.3s;
                }

                .chat-input:focus {
                    border-color: #667eea;
                }

                .send-btn {
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .send-btn:hover {
                    transform: scale(1.05);
                }

                .send-btn:active {
                    transform: scale(0.95);
                }

                @media (max-width: 768px) {
                    .chat-window {
                        width: calc(100% - 20px);
                        right: 10px;
                        left: 10px;
                        bottom: 100px;
                        height: 70vh;
                    }

                    .chat-toggle-btn {
                        bottom: 20px;
                        right: 20px;
                    }
                }
            `}</style>
        </>
    )
}
