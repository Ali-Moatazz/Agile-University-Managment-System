'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

// 1. Define the User type to match your SQL 'profiles' table
interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'doctor' | 'ta' | 'student'
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  // Changed to return any so the calling page can get the new user's ID
  createAccount: (email: string, password: string, fullName: string, role: string) => Promise<any>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Check localStorage on mount to keep the user logged in
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

  const login = async (email: string, password: string) => {
    // 1. Log into Supabase Auth Service
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // 2. Fetch the user's profile from your 'profiles' table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile not found in database. Contact admin.')
    }

    const authUser: AuthUser = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role
    }

    setUser(authUser)
    localStorage.setItem('unimanage_user', JSON.stringify(authUser))
  }

  const createAccount = async (email: string, password: string, fullName: string, role: string) => {
    if (!email || !password || !fullName) {
      throw new Error('All fields are required')
    }

    // 1. Create the Auth Login
    // We pass metadata so your SQL TRIGGER handles the 'profiles' table insert
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role.toLowerCase()
        }
      }
    })

    if (authError) throw authError

    // 2. Return the new user object
    // This allows StudentsPage to use newUser.id for the 'students' table
    return authData.user
  }

  const logout = async () => {
    await supabase.auth.signOut()
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