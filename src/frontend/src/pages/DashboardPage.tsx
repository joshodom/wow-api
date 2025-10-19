import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCharacter } from '../contexts/CharacterContext'
import { CheckCircle, XCircle, User, LogIn, Shield, Search, Filter, SortAsc, SortDesc, Zap, Target, Trophy, Star, Clock, TrendingUp, ChevronDown, Sparkles, Activity, Swords, Skull } from 'lucide-react'
import { notificationService } from '../services/NotificationService'
import { getClassColor, getClassTextColor } from '../utils/classColors'
import ResetStatusComponent from '../components/ResetStatusComponent'
import AutoRefreshComponent from '../components/AutoRefreshComponent'
import WeeklyQuestsSummary from '../components/WeeklyQuestsSummary'
import { LoadingSpinner, SkeletonCharacterCard } from '../components/LoadingComponents'
import { CharacterTooltip } from '../components/Tooltip'

// Helper function to get activity icon
const getActivityIcon = (activityType: string, activityName?: string) => {
    switch (activityType) {
        case 'MYTHIC_PLUS':
            return <Zap className="h-4 w-4" />
        case 'RAID':
            // Different icons for different raid difficulties
            if (activityName?.includes('Normal')) {
                return <Shield className="h-4 w-4" />
            } else if (activityName?.includes('Heroic')) {
                return <Swords className="h-4 w-4" />
            } else if (activityName?.includes('Mythic')) {
                return <Skull className="h-4 w-4" />
            }
            return <Shield className="h-4 w-4" />
        case 'QUEST':
            return <Target className="h-4 w-4" />
        case 'ACHIEVEMENT':
            return <Trophy className="h-4 w-4" />
        case 'PROFESSION':
            return <Star className="h-4 w-4" />
        default:
            return <Clock className="h-4 w-4" />
    }
}

// Helper function to get activity color
const getActivityColor = (activityType: string, completed: boolean, error?: string, activityName?: string) => {
    if (error) return 'text-red-500'
    if (completed) return 'text-green-500'

    switch (activityType) {
        case 'MYTHIC_PLUS':
            return 'text-purple-500'
        case 'RAID':
            // Different colors for different raid difficulties
            if (activityName?.includes('Normal')) {
                return 'text-blue-500'
            } else if (activityName?.includes('Heroic')) {
                return 'text-purple-500'
            } else if (activityName?.includes('Mythic')) {
                return 'text-orange-600'
            }
            return 'text-orange-500'
        case 'QUEST':
            return 'text-blue-500'
        case 'ACHIEVEMENT':
            return 'text-yellow-500'
        case 'PROFESSION':
            return 'text-green-500'
        default:
            return 'text-gray-500'
    }
}

// Helper function to calculate progress percentage
const getProgressPercentage = (character: any) => {
    if (!character.activities || character.activities.length === 0) return 0
    const completed = character.activities.filter((a: any) => a.completed).length
    return Math.round((completed / character.activities.length) * 100)
}

// Helper function to get progress status
const getProgressStatus = (percentage: number) => {
    if (percentage === 100) return { status: 'complete', color: 'bg-green-500', text: 'Complete!' }
    if (percentage >= 75) return { status: 'excellent', color: 'bg-blue-500', text: 'Excellent' }
    if (percentage >= 50) return { status: 'good', color: 'bg-yellow-500', text: 'Good' }
    if (percentage >= 25) return { status: 'fair', color: 'bg-orange-500', text: 'Fair' }
    return { status: 'poor', color: 'bg-red-500', text: 'Needs Work' }
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { characters, selectedCharacter, setSelectedCharacter, isLoading } = useCharacter()

    // Filtering and sorting state
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedFaction, setSelectedFaction] = useState('')
    const [selectedRealm, setSelectedRealm] = useState('')
    const [minLevel, setMinLevel] = useState(1)
    const [maxLevel, setMaxLevel] = useState(80)
    const [sortBy, setSortBy] = useState<'name' | 'level' | 'class' | 'progress'>('progress')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [showFilters, setShowFilters] = useState(false)
    const [expandedCharacter, setExpandedCharacter] = useState<number | null>(null)

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

    // Get unique values for filter dropdowns
    const uniqueClasses = useMemo(() => {
        return Array.from(new Set(characters.map(char => char.className))).sort()
    }, [characters])

    const uniqueFactions = useMemo(() => {
        return Array.from(new Set(characters.map(char => char.faction))).sort()
    }, [characters])

    const uniqueRealms = useMemo(() => {
        return Array.from(new Set(characters.map(char => char.realm))).sort()
    }, [characters])

    // Filtered and sorted characters
    const filteredAndSortedCharacters = useMemo(() => {
        let filtered = characters.filter(character => {
            // Search term filter
            if (searchTerm && !character.characterName.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false
            }

            // Class filter
            if (selectedClass && character.className !== selectedClass) {
                return false
            }

            // Faction filter
            if (selectedFaction && character.faction !== selectedFaction) {
                return false
            }

            // Realm filter
            if (selectedRealm && character.realm !== selectedRealm) {
                return false
            }

            // Level range filter
            if (character.level < minLevel || character.level > maxLevel) {
                return false
            }

            return true
        })

        // Sort characters
        filtered.sort((a, b) => {
            let comparison = 0

            switch (sortBy) {
                case 'name':
                    comparison = a.characterName.localeCompare(b.characterName)
                    break
                case 'level':
                    comparison = a.level - b.level
                    break
                case 'class':
                    comparison = a.className.localeCompare(b.className)
                    break
                case 'progress':
                    const aProgress = a.activities.filter((act: any) => act.completed).length / a.activities.length
                    const bProgress = b.activities.filter((act: any) => act.completed).length / b.activities.length
                    comparison = aProgress - bProgress
                    break
            }

            return sortOrder === 'asc' ? comparison : -comparison
        })

        return filtered
    }, [characters, searchTerm, selectedClass, selectedFaction, selectedRealm, minLevel, maxLevel, sortBy, sortOrder])

    // Reset filters function
    const resetFilters = () => {
        setSearchTerm('')
        setSelectedClass('')
        setSelectedFaction('')
        setSelectedRealm('')
        setMinLevel(1)
        setMaxLevel(80)
        setSortBy('progress')
        setSortOrder('desc')
    }

    // Handle character card click
    const handleCharacterClick = (character: any) => {
        setSelectedCharacter(character)
        setExpandedCharacter(expandedCharacter === character.characterId ? null : character.characterId)
    }

    const handleLogin = async () => {
        try {
            const response = await fetch('/auth/login')
            const data = await response.json()

            if (data.authUrl) {
                // Redirect to Battle.net authentication
                window.location.href = data.authUrl
            } else {
                throw new Error('Failed to get authorization URL')
            }
        } catch (error) {
            console.error('Login error:', error)
        }
    }

    if (!user) {
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

                                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                    <li className="flex items-center space-x-2">
                                        <Zap className="h-4 w-4 text-purple-600" />
                                        <span>Mythic+ Dungeons</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4 text-orange-600" />
                                        <span>Raid Encounters (Normal, Heroic, Mythic)</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <Target className="h-4 w-4 text-blue-600" />
                                        <span>Weekly Quests</span>
                                    </li>
                                </ul>
                            </div>

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


    return (
        <div className="space-y-6">
            {/* Weekly Reset Status */}
            <ResetStatusComponent />

            {/* Weekly Quests Summary */}
            <WeeklyQuestsSummary />

            {/* Character Selection */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Your Characters</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            {filteredAndSortedCharacters.length} of {characters.length} characters
                        </span>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-secondary flex items-center space-x-1"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                {/* Search and Sort Controls */}
                <div className="mb-4 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search characters..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name">Name</option>
                                <option value="level">Level</option>
                                <option value="class">Class</option>
                                <option value="progress">Progress</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="border-t pt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Class Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                    <select
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Classes</option>
                                        {uniqueClasses.map(className => (
                                            <option key={className} value={className}>{className}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Faction Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Faction</label>
                                    <select
                                        value={selectedFaction}
                                        onChange={(e) => setSelectedFaction(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Factions</option>
                                        {uniqueFactions.map(faction => (
                                            <option key={faction} value={faction}>{faction}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Realm Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Realm</label>
                                    <select
                                        value={selectedRealm}
                                        onChange={(e) => setSelectedRealm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Realms</option>
                                        {uniqueRealms.map(realm => (
                                            <option key={realm} value={realm}>{realm}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Level Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Level Range</label>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm text-gray-600">Min:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="80"
                                            value={minLevel}
                                            onChange={(e) => setMinLevel(parseInt(e.target.value) || 1)}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm text-gray-600">Max:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="80"
                                            value={maxLevel}
                                            onChange={(e) => setMaxLevel(parseInt(e.target.value) || 80)}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reset Filters Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {isLoading ? (
                    <div className="grid-responsive">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <SkeletonCharacterCard key={i} />
                        ))}
                        <div className="col-span-full text-center py-8">
                            <LoadingSpinner size="lg" text="Loading your characters..." />
                        </div>
                    </div>
                ) : filteredAndSortedCharacters.length === 0 ? (
                    <div className="text-center py-12 animate-fade-in-up">
                        <div className="text-gray-400 mb-4">
                            <User className="h-16 w-16 mx-auto animate-float" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Characters Found</h3>
                        <p className="text-gray-500 mb-4">
                            {characters.length === 0
                                ? "You don't have any characters yet. Try logging in to sync your characters."
                                : "No characters match your current filters. Try adjusting your search criteria."
                            }
                        </p>
                        <button
                            onClick={resetFilters}
                            className="btn-gradient-primary"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid-responsive">
                        {filteredAndSortedCharacters.map((character, index) => {
                            const classColor = getClassColor(character.className)
                            const hasErrors = character.activities.some((activity: any) => activity.error)

                            const isExpanded = expandedCharacter === character.characterId
                            const isSelected = selectedCharacter?.characterId === character.characterId

                            return (
                                <CharacterTooltip key={character.characterId} character={character}>
                                    <div
                                        className={`character-card group animate-fade-in-up ${hasErrors
                                            ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                            : isSelected
                                                ? 'border-blue-500 bg-blue-50 shadow-md hover:bg-blue-100'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Character Card Header */}
                                        <div
                                            className="p-4"
                                            onClick={() => handleCharacterClick(character)}
                                        >
                                            <div className="space-y-3">
                                                {/* Character Header */}
                                                <div className="flex items-center space-x-4">
                                                    <div className="character-avatar relative">
                                                        <div
                                                            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border-2 border-black shadow-lg"
                                                            style={{
                                                                backgroundColor: classColor,
                                                                color: getClassTextColor(character.className)
                                                            }}
                                                        >
                                                            {character.characterName.charAt(0).toUpperCase()}
                                                        </div>
                                                        {/* Level badge */}
                                                        <div className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                                                            {character.level}
                                                        </div>
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <h3 className="font-bold text-gray-900 text-xl group-hover:text-blue-600 transition-colors">
                                                            {character.characterName}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 capitalize font-medium">{character.realm}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                                                                backgroundColor: classColor + '20',
                                                                color: classColor
                                                            }}>
                                                                {character.className}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                                                                {character.race}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-center space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Sparkles className="h-4 w-4 text-yellow-500" />
                                                            <span className="text-sm font-bold text-gray-700">
                                                                {character.activities.filter((a: any) => a.completed).length}/{character.activities.length}
                                                            </span>
                                                        </div>
                                                        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Character Details */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className="h-4 w-4 text-gray-500" />
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

                                                {/* Enhanced Progress Bar */}
                                                <div className="pt-3 border-t border-gray-100">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Activity className="h-4 w-4 text-blue-500" />
                                                            <span className="text-sm font-semibold text-gray-700">Weekly Progress</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-bold text-gray-800">
                                                                {character.activities.filter((a: any) => a.completed).length}/{character.activities.length}
                                                            </span>
                                                            <span className={`text-sm px-3 py-1 rounded-full font-bold ${getProgressStatus(getProgressPercentage(character)).color} text-white shadow-sm`}>
                                                                {getProgressPercentage(character)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="progress-bar h-4 relative overflow-hidden">
                                                        <div
                                                            className={`progress-bar-fill ${getProgressStatus(getProgressPercentage(character)).color.replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-400 to-').replace('-500', '-600')}`}
                                                            style={{
                                                                width: character.activities.length > 0
                                                                    ? `${(character.activities.filter((a: any) => a.completed).length / character.activities.length) * 100}%`
                                                                    : '0%'
                                                            }}
                                                        >
                                                            {/* Animated shimmer effect */}
                                                            {getProgressPercentage(character) > 0 && (
                                                                <div className="progress-bar-shimmer" />
                                                            )}
                                                        </div>
                                                        {/* Progress percentage overlay */}
                                                        {getProgressPercentage(character) > 20 && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-white drop-shadow-sm">
                                                                    {getProgressPercentage(character)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Progress status */}
                                                    <div className="mt-2 text-center">
                                                        <span className={`text-sm font-semibold ${getProgressStatus(getProgressPercentage(character)).color.replace('bg-', 'text-')}`}>
                                                            {getProgressStatus(getProgressPercentage(character)).text}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Enhanced Expandable Activity Details */}
                                            {isExpanded && (
                                                <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 space-y-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-semibold text-gray-900 text-sm flex items-center space-x-2">
                                                            <TrendingUp className="h-4 w-4 text-blue-500" />
                                                            <span>Weekly Activities</span>
                                                        </h4>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-gray-500">
                                                                {character.activities.filter((a: any) => a.completed).length} of {character.activities.length} completed
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {character.activities.map((activity: any, index: number) => (
                                                            <div key={index} className={`bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-md ${activity.completed ? 'border-green-200 bg-green-50' :
                                                                activity.error ? 'border-red-200 bg-red-50' :
                                                                    'border-gray-200 hover:border-gray-300'
                                                                }`}>
                                                                {/* Enhanced Main Activity Row */}
                                                                <div className="flex items-center justify-between p-3">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className={`p-1 rounded-full ${getActivityColor(activity.type, activity.completed, activity.error, activity.name)}`}>
                                                                            {getActivityIcon(activity.type, activity.name)}
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-sm font-semibold text-gray-900">{activity.name}</span>
                                                                            <div className="text-xs text-gray-500 mt-0.5">{activity.description}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        {/* Enhanced status indicator */}
                                                                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full font-medium text-xs ${activity.error
                                                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                                                            : activity.completed
                                                                                ? 'bg-green-100 text-green-800 border border-green-200 animate-pulse'
                                                                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                                            }`}>
                                                                            {activity.error ? (
                                                                                <XCircle className="h-3 w-3" />
                                                                            ) : activity.completed ? (
                                                                                <CheckCircle className="h-3 w-3" />
                                                                            ) : (
                                                                                <Clock className="h-3 w-3" />
                                                                            )}
                                                                            <span>
                                                                                {activity.error ? 'Error' : activity.completed ? 'Completed' : 'Incomplete'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Enhanced Quest Details (if available) */}
                                                                {activity.type === 'QUEST' && activity.questDetails && (
                                                                    <div className="px-3 pb-3 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
                                                                        <div className="mt-3">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <Target className="h-3 w-3 text-blue-500" />
                                                                                    <span className="text-xs font-semibold text-gray-700">
                                                                                        {activity.questDetails.totalQuestsThisWeek} quest{activity.questDetails.totalQuestsThisWeek !== 1 ? 's' : ''} completed this week
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center space-x-1">
                                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                                    <span className="text-xs text-green-600 font-medium">Active</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                                                {activity.questDetails.completedQuests.slice(0, 10).map((quest: any, questIndex: number) => (
                                                                                    <div key={questIndex} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                                                                        <div className="flex items-center space-x-2 flex-1">
                                                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                                                            <span className="text-gray-700 truncate font-medium">{quest.name}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center space-x-1">
                                                                                            <Clock className="h-3 w-3 text-gray-400" />
                                                                                            <span className="text-gray-500 whitespace-nowrap font-medium">
                                                                                                {quest.hoursAgo < 24
                                                                                                    ? `${quest.hoursAgo}h ago`
                                                                                                    : `${Math.floor(quest.hoursAgo / 24)}d ago`
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                                {activity.questDetails.completedQuests.length > 10 && (
                                                                                    <div className="text-xs text-gray-500 text-center py-2 bg-gray-100 rounded-lg border border-gray-200">
                                                                                        <span className="font-medium">... and {activity.questDetails.completedQuests.length - 10} more quests</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Enhanced Footer with Progress Summary */}
                                                    <div className="pt-3 border-t border-gray-300 bg-white rounded-lg p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <Clock className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">
                                                                    Last updated: {character.lastUpdated.toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                    <span className="text-xs font-medium text-green-600">
                                                                        {character.activities.filter((a: any) => a.completed).length} completed
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                                    <span className="text-xs font-medium text-gray-500">
                                                                        {character.activities.filter((a: any) => !a.completed && !a.error).length} pending
                                                                    </span>
                                                                </div>
                                                                {character.activities.some((a: any) => a.error) && (
                                                                    <div className="flex items-center space-x-1">
                                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                                        <span className="text-xs font-medium text-red-600">
                                                                            {character.activities.filter((a: any) => a.error).length} error
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CharacterTooltip>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Auto-Refresh System */}
            <AutoRefreshComponent />

        </div>
    )
}

export default DashboardPage
