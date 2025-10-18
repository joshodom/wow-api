import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCharacter } from '../contexts/CharacterContext'
import { CheckCircle, XCircle, User, LogIn, Shield, Sword, Search, Filter, SortAsc, SortDesc, Zap, Target, Trophy, Star, Clock, TrendingUp } from 'lucide-react'
import { notificationService } from '../services/NotificationService'
import { getClassColor, getClassTextColor } from '../utils/classColors'

// Helper function to get activity icon
const getActivityIcon = (activityType: string) => {
    switch (activityType) {
        case 'MYTHIC_PLUS':
            return <Zap className="h-4 w-4" />
        case 'RAID':
            return <Shield className="h-4 w-4" />
        case 'QUEST':
            return <Target className="h-4 w-4" />
        case 'PVP':
            return <Sword className="h-4 w-4" />
        case 'ACHIEVEMENT':
            return <Trophy className="h-4 w-4" />
        case 'PROFESSION':
            return <Star className="h-4 w-4" />
        default:
            return <Clock className="h-4 w-4" />
    }
}

// Helper function to get activity color
const getActivityColor = (activityType: string, completed: boolean, error?: string) => {
    if (error) return 'text-red-500'
    if (completed) return 'text-green-500'
    
    switch (activityType) {
        case 'MYTHIC_PLUS':
            return 'text-purple-500'
        case 'RAID':
            return 'text-orange-500'
        case 'QUEST':
            return 'text-blue-500'
        case 'PVP':
            return 'text-red-500'
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
    const [sortBy, setSortBy] = useState<'name' | 'level' | 'class' | 'progress'>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
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
        setSortBy('name')
        setSortOrder('asc')
    }

    // Handle character card click
    const handleCharacterClick = (character: any) => {
        setSelectedCharacter(character)
        setExpandedCharacter(expandedCharacter === character.characterId ? null : character.characterId)
    }

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


    return (
        <div className="space-y-6">
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
                        <div className="space-y-4">
                            {/* Loading skeleton for character cards */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-4 animate-pulse">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                                        </div>
                                        <div className="h-6 bg-gray-300 rounded w-16"></div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="h-2 bg-gray-300 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto" />
                                <p className="mt-2 text-sm text-gray-600">Loading character data...</p>
                            </div>
                        </div>
                    ) : filteredAndSortedCharacters.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                            <User className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No characters found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your filters or search terms
                        </p>
                        <button
                            onClick={resetFilters}
                            className="btn btn-primary"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedCharacters.map((character) => {
                            const classColor = getClassColor(character.className)
                            const hasErrors = character.activities.some((activity: any) => activity.error)

                            const isExpanded = expandedCharacter === character.characterId
                            const isSelected = selectedCharacter?.characterId === character.characterId

                            return (
                                <div
                                    key={character.characterId}
                                    className={`rounded-lg border-2 transition-all duration-300 hover:shadow-md cursor-pointer ${hasErrors
                                        ? 'border-red-300 bg-red-50'
                                        : isSelected
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {/* Character Card Header */}
                                    <div
                                        className="p-4"
                                        onClick={() => handleCharacterClick(character)}
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
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">
                                                        {character.activities.filter((a: any) => a.completed).length} / {character.activities.length}
                                                    </span>
                                                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
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

                                            {/* Enhanced Progress Bar */}
                                            <div className="pt-2 border-t border-gray-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-gray-600">Weekly Progress</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs font-bold text-gray-800">
                                                            {character.activities.filter((a: any) => a.completed).length}/{character.activities.length}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getProgressStatus(getProgressPercentage(character)).color} text-white`}>
                                                            {getProgressPercentage(character)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-1000 ease-out relative ${getProgressStatus(getProgressPercentage(character)).color}`}
                                                        style={{
                                                            width: character.activities.length > 0
                                                                ? `${(character.activities.filter((a: any) => a.completed).length / character.activities.length) * 100}%`
                                                                : '0%'
                                                        }}
                                                    >
                                                        {/* Animated shimmer effect for completed progress */}
                                                        {getProgressPercentage(character) > 0 && (
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
                                                        )}
                                                    </div>
                                                    {/* Progress percentage text overlay */}
                                                    {getProgressPercentage(character) > 15 && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-white drop-shadow-sm">
                                                                {getProgressPercentage(character)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Progress status text */}
                                                <div className="mt-1 text-center">
                                                    <span className={`text-xs font-medium ${getProgressStatus(getProgressPercentage(character)).color.replace('bg-', 'text-')}`}>
                                                        {getProgressStatus(getProgressPercentage(character)).text}
                                                    </span>
                                                </div>
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
                                                    <div key={index} className={`bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
                                                        activity.completed ? 'border-green-200 bg-green-50' : 
                                                        activity.error ? 'border-red-200 bg-red-50' : 
                                                        'border-gray-200 hover:border-gray-300'
                                                    }`}>
                                                        {/* Enhanced Main Activity Row */}
                                                        <div className="flex items-center justify-between p-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className={`p-1 rounded-full ${getActivityColor(activity.type, activity.completed, activity.error)}`}>
                                                                    {getActivityIcon(activity.type)}
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm font-semibold text-gray-900">{activity.name}</span>
                                                                    <div className="text-xs text-gray-500 mt-0.5">{activity.description}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {/* Enhanced status indicator */}
                                                                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full font-medium text-xs ${
                                                                    activity.error
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
                            )
                        })}
                    </div>
                )}
            </div>

        </div>
    )
}

export default DashboardPage
