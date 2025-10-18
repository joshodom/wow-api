import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCharacter } from '../contexts/CharacterContext'
import { CheckCircle, XCircle, User, LogIn, Shield, Sword, Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import { notificationService } from '../services/NotificationService'
import { getClassColor, getClassTextColor } from '../utils/classColors'

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
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
                        <p className="mt-2 text-gray-600">Loading characters...</p>
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

                                            {/* Progress Bar */}
                                            <div className="pt-2 border-t border-gray-100">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-500">Weekly Progress</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
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
                                    </div>

                                    {/* Expandable Activity Details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
                                            <h4 className="font-medium text-gray-900 text-sm mb-3">Weekly Activities</h4>
                                            <div className="space-y-2">
                                                {character.activities.map((activity: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                                        <div className="flex items-center space-x-2">
                                                            {activity.error ? (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            ) : activity.completed ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-gray-400" />
                                                            )}
                                                            <span className="text-sm font-medium text-gray-900">{activity.name}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${activity.error
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : activity.completed
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {activity.error ? 'Error' : activity.completed ? 'Completed' : 'Incomplete'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-2 border-t border-gray-200">
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>Last updated: {character.lastUpdated.toLocaleDateString()}</span>
                                                    <span>{character.activities.filter((a: any) => a.completed).length} of {character.activities.length} completed</span>
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
