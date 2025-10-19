import React, { useMemo } from 'react'
import { Target, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useCharacter } from '../contexts/CharacterContext'

const WeeklyQuestsSummary: React.FC = () => {
    const { characters } = useCharacter()
    const [expanded, setExpanded] = React.useState(true)

    // Calculate weekly quest statistics
    const questStats = useMemo(() => {
        const stats = {
            totalCharacters: characters.length,
            charactersWithQuests: 0,
            charactersWithoutQuests: 0,
            totalQuestsCompleted: 0,
            recentQuests: [] as Array<{ characterName: string; questName: string; hoursAgo: number; className: string }>
        }

        characters.forEach(character => {
            const questActivity = character.activities.find(a => a.type === 'QUEST')
            
            if (questActivity && questActivity.completed && (questActivity as any).questDetails) {
                stats.charactersWithQuests++
                const questDetails = (questActivity as any).questDetails
                stats.totalQuestsCompleted += questDetails.totalQuestsThisWeek || 0
                
                // Add recent quests from this character
                if (questDetails.completedQuests && Array.isArray(questDetails.completedQuests)) {
                    questDetails.completedQuests.slice(0, 3).forEach((quest: any) => {
                        stats.recentQuests.push({
                            characterName: character.characterName,
                            questName: quest.name,
                            hoursAgo: quest.hoursAgo,
                            className: character.className
                        })
                    })
                }
            } else {
                stats.charactersWithoutQuests++
            }
        })

        // Sort recent quests by time
        stats.recentQuests.sort((a, b) => a.hoursAgo - b.hoursAgo)
        
        // Keep only the 10 most recent
        stats.recentQuests = stats.recentQuests.slice(0, 10)

        return stats
    }, [characters])

    if (characters.length === 0) {
        return null
    }

    const completionPercentage = Math.round((questStats.charactersWithQuests / questStats.totalCharacters) * 100)

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Weekly Quests Activity</h2>
                        <p className="text-sm text-gray-500">Track quest completion across your characters</p>
                    </div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {expanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Completed</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{questStats.charactersWithQuests}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pending</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{questStats.charactersWithoutQuests}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-gray-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Quests</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{questStats.totalQuestsCompleted}</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                    <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
                </div>
                <div className="progress-bar h-3 relative overflow-hidden">
                    <div
                        className="progress-bar-fill bg-gradient-to-r from-green-400 to-green-600"
                        style={{ width: `${completionPercentage}%` }}
                    >
                        {completionPercentage > 0 && (
                            <div className="progress-bar-shimmer" />
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Quests */}
            {expanded && questStats.recentQuests.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Recent Quest Completions</span>
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {questStats.recentQuests.map((quest, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{quest.questName}</p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium">{quest.characterName}</span>
                                            {' • '}
                                            <span className="text-gray-500">{quest.className}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-500 flex-shrink-0 ml-2">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-xs font-medium whitespace-nowrap">
                                        {quest.hoursAgo < 24
                                            ? `${quest.hoursAgo}h ago`
                                            : `${Math.floor(quest.hoursAgo / 24)}d ago`
                                        }
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {expanded && questStats.recentQuests.length === 0 && (
                <div className="border-t border-gray-200 pt-4">
                    <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No weekly quests completed yet this week</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WeeklyQuestsSummary

