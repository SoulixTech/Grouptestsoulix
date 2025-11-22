'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        // Check if admin is logged in
        const adminStatus = localStorage.getItem('isAdmin')
        const adminUser = localStorage.getItem('adminUser')
        if (adminStatus === 'true' && adminUser) {
            setIsAdmin(true)
            setCurrentUser(adminUser)
        }
        setIsLoading(false)
    }, [])

    const login = async (username, password) => {
        try {
            // Check credentials against Supabase admin_users table
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single()

            if (error || !data) {
                return false
            }

            setIsAdmin(true)
            setCurrentUser(username)
            localStorage.setItem('isAdmin', 'true')
            localStorage.setItem('adminUser', username)
            return true
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    }

    const logout = () => {
        setIsAdmin(false)
        setCurrentUser(null)
        localStorage.removeItem('isAdmin')
        localStorage.removeItem('adminUser')
    }

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout, isLoading, currentUser }}>
            {children}
        </AuthContext.Provider>
    )
}
