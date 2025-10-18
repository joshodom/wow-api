import React, { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCharacter } from '../contexts/CharacterContext'
import { Sword, Settings, LogOut, RefreshCw } from 'lucide-react'

interface LayoutProps {
    children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth()
    const { isLoading, refreshCharacterData, selectedCharacter } = useCharacter()

    const handleRefresh = async () => {
        if (selectedCharacter) {
            try {
                await refreshCharacterData(selectedCharacter.characterId)
            } catch (error) {
                console.error('Failed to refresh data:', error)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Sword className="h-8 w-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-900">
                                WoW Weekly Tracker
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <>
                                    <span className="text-sm text-gray-600">
                                        {user.battleTag}
                                    </span>

                                    <button
                                        onClick={handleRefresh}
                                        disabled={isLoading}
                                        className="btn btn-secondary flex items-center space-x-2"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        <span>Refresh</span>
                                    </button>

                                    <button className="btn btn-secondary flex items-center space-x-2">
                                        <Settings className="h-4 w-4" />
                                        <span>Settings</span>
                                    </button>

                                    <button
                                        onClick={logout}
                                        className="btn btn-secondary flex items-center space-x-2"
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
