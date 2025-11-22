'use client'

import { useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { supabase } from '../../lib/supabase'

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
)

export default function StatisticsPage() {
    const [loading, setLoading] = useState(true)
    const [categoryData, setCategoryData] = useState(null)
    const [memberData, setMemberData] = useState(null)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)

            const { data: expenses, error } = await supabase
                .from('expenses')
                .select('*')

            if (error) throw error

            if (!expenses || expenses.length === 0) {
                setLoading(false)
                return
            }

            // Process Category Data
            const categories = {}
            expenses.forEach(exp => {
                const cat = exp.category || 'Uncategorized'
                categories[cat] = (categories[cat] || 0) + exp.amount
            })

            setCategoryData({
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ],
                    hoverBackgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ]
                }]
            })

            // Process Member Data (Spending)
            const memberSpending = {}
            expenses.forEach(exp => {
                const member = exp.paid_by
                memberSpending[member] = (memberSpending[member] || 0) + exp.amount
            })

            setMemberData({
                labels: Object.keys(memberSpending),
                datasets: [{
                    label: 'Total Paid',
                    data: Object.values(memberSpending),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            })

        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <TopBar title="Statistics" subtitle="Analyze spending patterns" />

                <div className="content-section active">
                    <div className="widget">
                        <div className="widget-header">
                            <h3>📈 Statistics Dashboard</h3>
                        </div>

                        {loading ? (
                            <div className="loading">Loading statistics...</div>
                        ) : !categoryData ? (
                            <div className="no-data">No data available</div>
                        ) : (
                            <div className="stats-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '2rem',
                                marginTop: '2rem'
                            }}>
                                <div className="chart-container" style={{
                                    background: 'var(--bg-secondary)',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h4 style={{ marginBottom: '1rem', textAlign: 'center' }}>Expenses by Category</h4>
                                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                                        <Doughnut data={categoryData} options={{ maintainAspectRatio: false }} />
                                    </div>
                                </div>

                                <div className="chart-container" style={{
                                    background: 'var(--bg-secondary)',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h4 style={{ marginBottom: '1rem', textAlign: 'center' }}>Spending by Member</h4>
                                    <div style={{ height: '300px' }}>
                                        <Bar
                                            data={memberData}
                                            options={{
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
