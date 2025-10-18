import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCharacter } from '../contexts/CharacterContext'
import { CheckCircle, XCircle, Clock, User, Bell, LogIn, Shield, Sword } from 'lucide-react'
import { notificationService } from '../services/NotificationService'
import { getClassColor, getClassTextColor } from '../utils/classColors'

const DashboardPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { characters, selectedCharacter, setSelectedCharacter, isLoading } = useCharacter()

    // Check for notifications on component mount
    useEffect(() => {
        if (selectedCharacter && selectedCharacter.activities) {
            selectedCharacter.activities.forEach((activity: any) => {
                if (activity.completed) {
                    notificationService.showActivityCompleted(
                        selectedCharacter.characterName,
                        activity.name
                    );
                }
            });
        }
    }, [selectedCharacter]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            WoW Weekly Tracker
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please log in to view your dashboard
                        </p>
                    </div>

                    <div className="card">
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Welcome to WoW Weekly Tracker
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Sign in with your Battle.net account to start tracking your weekly activities across all your characters.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full btn btn-primary flex items-center justify-center space-x-2"
                            >
                                <LogIn className="h-4 w-4" />
                                <span>Sign in with Battle.net</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'MYTHIC_PLUS':
                return <CheckCircle className="h-5 w-5" />
            case 'RAID':
                return <XCircle className="h-5 w-5" />
            case 'QUEST':
                return <Clock className="h-5 w-5" />
            default:
                return <CheckCircle className="h-5 w-5" />
        }
    }

    const getActivityColor = (completed: boolean) => {
        return completed ? 'text-green-600' : 'text-red-600'
    }

    return (
        <div className="space-y-6">
            {/* Character Selection */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Characters</h2>
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
                        <p className="mt-2 text-gray-600">Loading characters...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {characters.map((character) => {
                            const classColor = getClassColor(character.className)

                            return (
                                <button
                                    key={character.characterId}
                                    onClick={() => setSelectedCharacter(character)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${selectedCharacter?.characterId === character.characterId
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="space-y-3">
                                        {/* Character Header */}
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 border-black"
                                                style={{ 
                                                    backgroundColor: classColor,
                                                    color: getClassTextColor(character.className)
                                                }}
                                            >
                                                {character.characterName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-left flex-1">
                                                <h3 className="font-semibold text-gray-900 text-lg">{character.characterName}</h3>
                                                <p className="text-sm text-gray-600 capitalize">{character.realm}</p>
                                            </div>
                                        </div>

                                        {/* Character Details */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Sword className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium" style={{ color: getClassTextColor(character.className) }}>
                                                        {character.className}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">{character.race}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Level {character.level}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${character.faction === 'ALLIANCE'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {character.faction}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="pt-2 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Weekly Progress</span>
                                                <span className="text-xs font-medium text-gray-700">
                                                    {character.activities.filter((a: any) => a.completed).length} / {character.activities.length}
                                                </span>
                                            </div>
                                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        backgroundColor: classColor,
                                                        width: character.activities.length > 0
                                                            ? `${(character.activities.filter((a: any) => a.completed).length / character.activities.length) * 100}%`
                                                            : '0%'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Weekly Activities */}
            {selectedCharacter && (
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Weekly Activities - {selectedCharacter.characterName}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Bell className={`h-4 w-4 ${notificationService.hasPermission() ? 'text-green-500' : 'text-gray-400'}`} />
                                <span className="text-xs text-gray-500">
                                    {notificationService.hasPermission() ? 'Notifications On' : 'Notifications Off'}
                                </span>
                            </div>
                            <span className="text-sm text-gray-500">
                                Last updated: {selectedCharacter.lastUpdated.toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
                            <p className="mt-2 text-gray-600">Loading activities...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedCharacter.activities.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No weekly activities found for this character.</p>
                                    <p className="text-sm mt-1">Activities will appear here once they're detected.</p>
                                </div>
                            ) : (
                                selectedCharacter.activities.map((activity: any) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={getActivityColor(activity.completed)}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{activity.name}</h3>
                                                <p className="text-sm text-gray-600">{activity.description}</p>
                                                {activity.progress !== undefined && activity.maxProgress !== undefined && (
                                                    <div className="mt-1">
                                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${(activity.progress / activity.maxProgress) * 100}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {activity.progress} / {activity.maxProgress}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-medium ${getActivityColor(activity.completed)}`}>
                                                {activity.completed ? 'Completed' : 'Incomplete'}
                                            </div>
                                            {activity.completedAt && (
                                                <div className="text-xs text-gray-500">
                                                    {activity.completedAt.toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DashboardPage
