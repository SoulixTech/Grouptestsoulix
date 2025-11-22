'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { supabase } from '../../lib/supabase'

export default function BalancesPage() {
    const [balances, setBalances] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        calculateBalances()
    }, [])

    const calculateBalances = async () => {
        try {
            setLoading(true)

            // Fetch all necessary data
            const { data: membersData } = await supabase.from('members').select('name')
            const { data: expensesData } = await supabase.from('expenses').select('*')
            const { data: paymentsData } = await supabase.from('payments').select('*')

            if (!membersData || !expensesData) return

            const members = membersData.map(m => m.name)
            const memberBalances = {}
            members.forEach(m => {
                memberBalances[m] = {
                    totalPaid: 0,
                    totalShare: 0,
                    balance: 0
                }
            })

            // Process expenses
            expensesData.forEach(expense => {
                const paidBy = expense.paid_by
                const amount = expense.amount

                // Credit the payer
                if (memberBalances[paidBy]) {
                    memberBalances[paidBy].totalPaid += amount
                }

                // Debit the involved members
                if (expense.involved && expense.involved.length > 0) {
                    if (expense.split_details) {
                        Object.entries(expense.split_details).forEach(([member, splitAmount]) => {
                            if (memberBalances[member]) {
                                memberBalances[member].totalShare += splitAmount
                            }
                        })
                    } else {
                        const splitAmount = amount / expense.involved.length
                        expense.involved.forEach(member => {
                            if (memberBalances[member]) {
                                memberBalances[member].totalShare += splitAmount
                            }
                        })
                    }
                }
            })

            // Process payments
            if (paymentsData) {
                paymentsData.forEach(payment => {
                    if (memberBalances[payment.from_user]) {
                        memberBalances[payment.from_user].totalPaid += payment.amount
                    }
                    if (memberBalances[payment.to_user]) {
                        memberBalances[payment.to_user].totalShare += payment.amount
                    }
                })
            }

            // Calculate final balances
            Object.keys(memberBalances).forEach(member => {
                memberBalances[member].balance = memberBalances[member].totalPaid - memberBalances[member].totalShare
            })

            // Convert to array for display
            const balancesArray = Object.entries(memberBalances).map(([member, data]) => ({
                member,
                totalPaid: data.totalPaid,
                totalShare: data.totalShare,
                balance: data.balance
            })).sort((a, b) => b.balance - a.balance)

            setBalances(balancesArray)

        } catch (error) {
            console.error('Error calculating balances:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <TopBar title="Individual Balances" subtitle="See who owes what" />

                <div className="content-section active">
                    <div className="widget">
                        <div className="widget-header">
                            <div>
                                <h3>💵 Individual Balances</h3>
                                <p className="section-description">See who paid what and who owes whom</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading">Calculating balances...</div>
                        ) : balances.length === 0 ? (
                            <div className="no-data">No balances to show</div>
                        ) : (
                            <div className="balances-grid-modern">
                                {balances.map((item, index) => {
                                    const isPositive = item.balance >= 0
                                    const isZero = Math.abs(item.balance) < 0.01
                                    return (
                                        <div key={index} className={`balance-card-modern ${isPositive ? 'positive' : 'negative'} ${isZero ? 'settled' : ''}`}>
                                            <div className="balance-card-header">
                                                <div className="member-avatar">
                                                    {item.member.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="member-info">
                                                    <h4 className="member-name">{item.member}</h4>
                                                </div>
                                            </div>

                                            <div className="balance-breakdown">
                                                <div className="breakdown-row">
                                                    <span className="breakdown-label">Total Paid:</span>
                                                    <span className="breakdown-value">₹{item.totalPaid.toFixed(2)}</span>
                                                </div>
                                                <div className="breakdown-row">
                                                    <span className="breakdown-label">Total Owed:</span>
                                                    <span className="breakdown-value">₹{item.totalShare.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="balance-divider"></div>

                                            <div className="balance-footer">
                                                <div className="balance-label-section">
                                                    <span className="balance-label-text">Balance:</span>
                                                </div>
                                                <div className="amount-display">
                                                    {item.balance >= 0 ? '+' : ''}₹{Math.abs(item.balance).toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="status-section">
                                                {isZero ? (
                                                    <span className="status-badge settled-badge">✅ All Settled</span>
                                                ) : isPositive ? (
                                                    <span className="status-badge positive-badge">Gets back ₹{item.balance.toFixed(2)}</span>
                                                ) : (
                                                    <span className="status-badge negative-badge">Needs to pay ₹{Math.abs(item.balance).toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <style jsx>{`
                        .balances-grid-modern {
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                            gap: 24px;
                            margin-top: 24px;
                        }

                        .balance-card-modern {
                            background: white;
                            border-radius: 20px;
                            padding: 28px;
                            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                            border: 2px solid transparent;
                            position: relative;
                            overflow: hidden;
                        }

                        .balance-card-modern::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 5px;
                            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        }

                        .balance-card-modern:hover {
                            transform: translateY(-8px);
                            box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15);
                            border-color: rgba(102, 126, 234, 0.2);
                        }

                        .balance-card-modern:hover::before {
                            opacity: 1;
                        }

                        .balance-card-modern.positive {
                            background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
                            border-left: 5px solid #10b981;
                        }

                        .balance-card-modern.negative {
                            background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
                            border-left: 5px solid #ef4444;
                        }

                        .balance-card-modern.settled {
                            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
                            border-left: 5px solid #64748b;
                        }

                        .balance-card-header {
                            display: flex;
                            align-items: center;
                            gap: 16px;
                            margin-bottom: 24px;
                        }

                        .member-avatar {
                            width: 56px;
                            height: 56px;
                            border-radius: 16px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            font-weight: 700;
                            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                        }

                        .balance-card-modern.negative .member-avatar {
                            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                            box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
                        }

                        .balance-card-modern.settled .member-avatar {
                            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
                            box-shadow: 0 8px 20px rgba(100, 116, 139, 0.3);
                        }

                        .member-info {
                            flex: 1;
                        }

                        .member-name {
                            font-size: 20px;
                            font-weight: 700;
                            color: #1e293b;
                            margin: 0;
                            letter-spacing: -0.5px;
                        }

                        .balance-breakdown {
                            margin: 20px 0;
                        }

                        .breakdown-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 12px 0;
                            border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
                        }

                        .breakdown-row:last-child {
                            border-bottom: none;
                        }

                        .breakdown-label {
                            font-size: 14px;
                            font-weight: 600;
                            color: #64748b;
                        }

                        .breakdown-value {
                            font-size: 16px;
                            font-weight: 700;
                            color: #1e293b;
                        }

                        .balance-divider {
                            height: 2px;
                            background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
                            margin: 20px 0;
                        }

                        .balance-footer {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 16px;
                        }

                        .balance-label-section {
                            display: flex;
                            flex-direction: column;
                        }

                        .balance-label-text {
                            font-size: 16px;
                            font-weight: 700;
                            color: #1e293b;
                        }

                        .balance-status {
                            font-size: 14px;
                            font-weight: 600;
                            margin: 0;
                            color: #64748b;
                        }

                        .balance-amount-section {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding-top: 20px;
                            border-top: 2px solid rgba(0, 0, 0, 0.05);
                        }

                        .amount-display {
                            font-size: 32px;
                            font-weight: 800;
                            letter-spacing: -1px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                        }

                        .balance-card-modern.negative .amount-display {
                            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                        }

                        .balance-card-modern.settled .amount-display {
                            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                        }

                        .balance-indicator {
                            display: flex;
                            flex-direction: column;
                            align-items: flex-end;
                        }

                        .status-section {
                            margin-top: 16px;
                        }

                        .status-badge {
                            display: block;
                            padding: 12px 20px;
                            border-radius: 12px;
                            font-size: 14px;
                            font-weight: 700;
                            text-align: center;
                            width: 100%;
                        }

                        .positive-badge {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                        }

                        .negative-badge {
                            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                            color: white;
                            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
                        }

                        .settled-badge {
                            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
                            color: white;
                            box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
                        }

                        @media (max-width: 768px) {
                            .balances-grid-modern {
                                grid-template-columns: 1fr;
                                gap: 16px;
                            }

                            .balance-card-modern {
                                padding: 20px;
                            }

                            .amount-display {
                                font-size: 28px;
                            }

                            .member-avatar {
                                width: 48px;
                                height: 48px;
                                font-size: 20px;
                            }

                            .member-name {
                                font-size: 18px;
                            }
                        }
                    `}</style>
                </div>
            </div>
        </>
    )
}
