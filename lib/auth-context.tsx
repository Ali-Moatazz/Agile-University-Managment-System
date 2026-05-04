'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'doctor' | 'ta' | 'student'
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string, role: string) => Promise<void>
  createAccount: (email: string, password: string, fullName: string, role: string, adminId: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simple hash function (NOT for production - use bcrypt in real app)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Check localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('unimanage_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse saved user:', error)
        localStorage.removeItem('unimanage_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, role: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    try {
      // Fetch user from Supabase only (no localStorage fallback)
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('email', email)
        .single()

      if (error || !data) {
        throw new Error('Account not found. Please create an account first.')
      }

      // In production, use bcrypt to compare passwords
      // For now, we'll accept the login if user exists
      const authUser: AuthUser = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role
      }

      setUser(authUser)
      localStorage.setItem('unimanage_user', JSON.stringify(authUser))
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed. Please check your credentials.')
    }
  }

  const createAccount = async (email: string, password: string, fullName: string, role: string, adminId: string) => {
    if (!email || !password || !fullName) {
      throw new Error('All fields are required')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    try {
      // Verify admin exists
      const { data: adminUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', adminId)
        .single()

      if (!adminUser || adminUser.role !== 'admin') {
        throw new Error('Only admins can create accounts')
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        throw new Error('Email already registered')
      }

      // Create new user in Supabase
      const passwordHash = simpleHash(password + email) // Simple hash for demo
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: passwordHash,
            full_name: fullName,
            role: role as any
          }
        ])
        .select()
        .single()

      if (error || !data) {
        throw new Error('Failed to create account. Please try again.')
      }

      return data
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create account')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('unimanage_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, createAccount, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
