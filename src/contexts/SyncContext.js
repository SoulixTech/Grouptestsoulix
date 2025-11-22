'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const SyncContext = createContext()

export function SyncProvider({ children }) {
    const [syncStatus, setSyncStatus] = useState('synced') // 'syncing', 'synced', 'error'
    const [lastSyncTime, setLastSyncTime] = useState(new Date())

    useEffect(() => {
        // Subscribe to all table changes
        const expensesSubscription = supabase
            .channel('expenses_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'expenses' },
                (payload) => {
                    console.log('Expenses change detected:', payload)
                    setSyncStatus('syncing')
                    setTimeout(() => {
                        setSyncStatus('synced')
                        setLastSyncTime(new Date())
                        // Trigger page refresh or data reload
                        window.dispatchEvent(new CustomEvent('dataUpdated', { 
                            detail: { table: 'expenses', payload } 
                        }))
                    }, 500)
                }
            )
            .subscribe()

        const membersSubscription = supabase
            .channel('members_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'members' },
                (payload) => {
                    console.log('Members change detected:', payload)
                    setSyncStatus('syncing')
                    setTimeout(() => {
                        setSyncStatus('synced')
                        setLastSyncTime(new Date())
                        window.dispatchEvent(new CustomEvent('dataUpdated', { 
                            detail: { table: 'members', payload } 
                        }))
                    }, 500)
                }
            )
            .subscribe()

        const paymentsSubscription = supabase
            .channel('payments_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'payments' },
                (payload) => {
                    console.log('Payments change detected:', payload)
                    setSyncStatus('syncing')
                    setTimeout(() => {
                        setSyncStatus('synced')
                        setLastSyncTime(new Date())
                        window.dispatchEvent(new CustomEvent('dataUpdated', { 
                            detail: { table: 'payments', payload } 
                        }))
                    }, 500)
                }
            )
            .subscribe()

        // Cleanup subscriptions
        return () => {
            expensesSubscription.unsubscribe()
            membersSubscription.unsubscribe()
            paymentsSubscription.unsubscribe()
        }
    }, [])

    return (
        <SyncContext.Provider value={{ syncStatus, lastSyncTime }}>
            {children}
        </SyncContext.Provider>
    )
}

export function useSync() {
    const context = useContext(SyncContext)
    if (!context) {
        throw new Error('useSync must be used within SyncProvider')
    }
    return context
}
