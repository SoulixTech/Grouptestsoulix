'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function MembersPage() {
    const { isAdmin } = useAuth()
    const [members, setMembers] = useState([])
    const [newMember, setNewMember] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error
            setMembers(data || [])
        } catch (error) {
            console.error('Error fetching members:', error)
            alert('Error loading members')
        } finally {
            setLoading(false)
        }
    }

    const addMember = async () => {
        if (!newMember.trim()) return

        try {
            const name = newMember.trim()

            // Check if member exists locally first to avoid duplicate calls
            if (members.some(m => m.name === name)) {
                alert('Member already exists')
                return
            }

            const { data, error } = await supabase
                .from('members')
                .insert([{ name }])
                .select()

            if (error) throw error

            if (data) {
                setMembers([...members, data[0]])
                setNewMember('')
            }
        } catch (error) {
            console.error('Error adding member:', error)
            alert('Error adding member')
        }
    }

    const removeMember = async (id, name) => {
        if (confirm(`Are you sure you want to remove ${name}?`)) {
            try {
                const { error } = await supabase
                    .from('members')
                    .delete()
                    .eq('id', id)

                if (error) throw error

                setMembers(members.filter(m => m.id !== id))
            } catch (error) {
                console.error('Error removing member:', error)
                alert('Error removing member')
            }
        }
    }

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <TopBar title="Team Members" subtitle="Manage your group members" />

                <div className="content-section active">
                    <div className="widget">
                        <h3>👥 Team Members</h3>
                        <p className="section-description">Manage your group members</p>

                        {!isAdmin && (
                            <div style={{
                                padding: '1rem 1.5rem',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                color: 'white',
                                margin: '0 0 1rem 0',
                                borderRadius: '12px',
                                fontWeight: '600',
                                textAlign: 'center',
                                boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
                            }}>
                                🔒 Read-Only Mode - Login as admin to manage members
                            </div>
                        )}

                        <div className="members-input">
                            <input
                                type="text"
                                value={newMember}
                                onChange={(e) => setNewMember(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && isAdmin && addMember()}
                                placeholder="Enter member name"
                                disabled={loading || !isAdmin}
                            />
                            <button onClick={addMember} className="btn btn-primary" disabled={loading || !isAdmin}>
                                {loading ? 'Loading...' : !isAdmin ? '🔒 Admin Only' : 'Add Member'}
                            </button>
                        </div>

                        <div className="members-list">
                            {loading ? (
                                <p>Loading members...</p>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className="member-tag">
                                        {member.name}
                                        {isAdmin && (
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeMember(member.id, member.name)}
                                            >
                                                ×
                                            </button>
                                        )}
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
