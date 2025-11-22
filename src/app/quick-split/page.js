'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

export default function QuickSplitPage() {
    const [totalAmount, setTotalAmount] = useState('')
    const [numberOfPeople, setNumberOfPeople] = useState(10)
    const [result, setResult] = useState(null)

    const calculateSplit = () => {
        const amount = parseFloat(totalAmount)
        const people = parseInt(numberOfPeople)

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount')
            return
        }

        if (!people || people < 1 || people > 10) {
            alert('Please enter a number between 1 and 10')
            return
        }

        const perPerson = amount / people
        setResult({
            total: amount,
            people: people,
            perPerson: perPerson
        })
    }

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <TopBar title="Quick Split" subtitle="Calculate splits instantly" />

                <div className="content-section active">
                    <div className="form-card">
                        <div className="card-header">
                            <h2>🧮 Quick Amount Divider</h2>
                            <p>Instantly calculate how to split any amount</p>
                        </div>
                        <div className="card-body">
                            <div className="divider-tool">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="totalAmount">Total Amount (₹)</label>
                                        <input
                                            type="number"
                                            id="totalAmount"
                                            value={totalAmount}
                                            onChange={(e) => setTotalAmount(e.target.value)}
                                            placeholder="Enter amount in rupees"
                                            step="0.01"
                                            className="input-large"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="numberOfPeople">Number of People</label>
                                        <input
                                            type="number"
                                            id="numberOfPeople"
                                            value={numberOfPeople}
                                            onChange={(e) => setNumberOfPeople(e.target.value)}
                                            min="1"
                                            max="10"
                                            className="input-large"
                                        />
                                    </div>
                                </div>
                                <button onClick={calculateSplit} className="btn btn-primary btn-large">
                                    <span>Calculate Split</span>
                                </button>

                                {result && (
                                    <div className="divider-result active">
                                        <h3>💰 Split Result</h3>
                                        <div className="divider-amount">₹{result.perPerson.toFixed(2)}</div>
                                        <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>per person</p>
                                        <p style={{ marginTop: '15px', textAlign: 'center', opacity: 0.9 }}>
                                            Total: ₹{result.total.toFixed(2)} ÷ {result.people} people
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
