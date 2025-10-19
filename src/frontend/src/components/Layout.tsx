import React, { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCharacter } from '../contexts/CharacterContext'
import { useTheme, ThemeToggle } from '../contexts/ThemeContext'
import { Sword, Settings, LogOut, RefreshCw, Home, User } from 'lucide-react'

interface LayoutProps {
    children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth()
    const { isLoading, refreshCharacterData, selectedCharacter, error } = useCharacter()
    const { isDark } = useTheme()
    const location = useLocation()

    const handleRefresh = async () => {
        if (selectedCharacter) {
            try {
                await refreshCharacterData(selectedCharacter.characterId)
                console.log('Character data refreshed successfully')
            } catch (error) {
                console.error('Failed to refresh data:', error)
            }
        }
    }

    const isActive = (path: string) => {
        return location.pathname === path
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <header className={`shadow-sm border-b transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Sword className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            <h1 className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                WoW Weekly Tracker
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Navigation */}
                            <nav className="hidden md:flex items-center space-x-2">
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                                        isActive('/') 
                                            ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700')
                                            : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                                    }`}
                                >
                                    <Home className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    to="/settings"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                                        isActive('/settings') 
                                            ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700')
                                            : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                                    }`}
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </nav>

                            {user && (
                                <>
                                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {user.battleTag}
                                        </span>
                                    </div>

                                    {error && (
                                        <span className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
                                            {error}
                                        </span>
                                    )}

                                    <button
                                        onClick={handleRefresh}
                                        disabled={isLoading || !selectedCharacter}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                                            isLoading || !selectedCharacter
                                                ? (isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                                                : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                                        }`}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        <span>Refresh</span>
                                    </button>

                                    <ThemeToggle />

                                    <button
                                        onClick={logout}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                                            isDark 
                                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                : 'bg-red-50 hover:bg-red-100 text-red-700'
                                        }`}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}

export default Layout
