import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { BlizzardCharacter } from '../../../shared/types'

interface User {
    id: string
    battleTag: string
    characters: BlizzardCharacter[]
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (authUrl: string) => Promise<void>
    logout: () => void
    isLoading: boolean
    error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Ensure we're in a browser environment
        if (typeof window === 'undefined') {
            setIsLoading(false)
            return
        }

        try {
            // Check for token in URL (from OAuth callback)
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get('token');

            if (tokenFromUrl) {
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);

                // Store token and verify it
                localStorage.setItem('wow_tracker_token', tokenFromUrl);
                verifyToken(tokenFromUrl);
            } else {
                // Check for stored token on app start
                const storedToken = localStorage.getItem('wow_tracker_token')
                if (storedToken) {
                    setToken(storedToken)
                    // Verify token and get user data
                    verifyToken(storedToken)
                } else {
                    setIsLoading(false)
                }
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error)
            setIsLoading(false)
        }
    }, [])

    const verifyToken = async (tokenToVerify: string) => {
        try {
            console.log('Verifying token:', tokenToVerify.substring(0, 20) + '...')
            const response = await axios.get('/api/characters', {
                headers: {
                    Authorization: `Bearer ${tokenToVerify}`
                }
            })

            console.log('Token verification successful, response:', response.data)
            // If we get here, token is valid
            setUser({
                id: 'user_id', // We'll get this from the token
                battleTag: 'Unknown', // We'll get this from the API
                characters: response.data.characters || []
            })
            setToken(tokenToVerify)
        } catch (error) {
            console.error('Token verification failed:', error)
            try {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('wow_tracker_token')
                }
            } catch (storageError) {
                console.error('Error removing token from localStorage:', storageError)
            }
            setToken(null)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (authUrl: string) => {
        setIsLoading(true)
        setError(null)

        try {
            // Debug: log the auth URL
            console.log('Auth URL received:', authUrl)

            // Clean the URL if it has any issues
            const cleanUrl = authUrl.replace(/^@/, '')
            console.log('Clean URL:', cleanUrl)

            // Redirect to auth URL
            window.location.href = cleanUrl
        } catch (error) {
            console.error('Login failed:', error)
            setError('Login failed. Please try again.')
            setIsLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('wow_tracker_token')
            }
        } catch (error) {
            console.error('Error removing token from localStorage:', error)
        }
    }

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isLoading,
        error
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
