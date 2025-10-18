import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Shield, Sword, ArrowRight } from 'lucide-react'

const LoginPage: React.FC = () => {
    const { login, isLoading, error } = useAuth()

    const handleLogin = async () => {
        try {
            const response = await fetch('/auth/login')
            const data = await response.json()

            console.log('Backend response:', data)

            if (data.authUrl) {
                console.log('Auth URL from backend:', data.authUrl)
                await login(data.authUrl)
            } else {
                throw new Error('Failed to get authorization URL')
            }
        } catch (error) {
            console.error('Login error:', error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        WoW Weekly Tracker
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Track your weekly activities across all characters
                    </p>
                </div>

                <div className="card">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Connect with Battle.net
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Sign in with your Battle.net account to start tracking your weekly activities.
                                We'll help you keep track of:
                            </p>

                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center space-x-2">
                                    <Sword className="h-4 w-4 text-green-600" />
                                    <span>Mythic+ Dungeons</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <Shield className="h-4 w-4 text-green-600" />
                                    <span>Raid Encounters</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <ArrowRight className="h-4 w-4 text-green-600" />
                                    <span>Weekly Quests</span>
                                </li>
                            </ul>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full btn btn-primary flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                                <Shield className="h-4 w-4" />
                            )}
                            <span>{isLoading ? 'Connecting...' : 'Sign in with Battle.net'}</span>
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                            By signing in, you agree to our terms of service and privacy policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
