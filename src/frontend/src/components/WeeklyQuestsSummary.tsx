import React, { useMemo } from 'react'
import { Target, ChevronDown, ChevronUp, Trophy, Sparkles, Mountain, Disc } from 'lucide-react'
import { TRACKED_WEEKLY_QUESTS, BONUS_EVENTS, BONUS_EVENT_REFERENCE_DATE } from '../../../shared/constants'

const WeeklyQuestsSummary: React.FC = () => {
    const [expanded, setExpanded] = React.useState(true)

    // Calculate which bonus event is active this week
    const currentBonusEvent = useMemo(() => {
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - BONUS_EVENT_REFERENCE_DATE.getTime())
        const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000))
        const currentWeek = (diffWeeks % 7) + 1

        // Find the bonus event for this week
        const event = Object.values(BONUS_EVENTS).find(e => e.week === currentWeek)
        return event || BONUS_EVENTS.BATTLEGROUNDS
    }, [])

    // Helper to get icon for quest type
    const getQuestIcon = (questId: string) => {
        switch (questId) {
            case 'world_soul':
                return <Sparkles className="h-4 w-4 text-amber-600" />
            case 'delves_weekly':
                return <Mountain className="h-4 w-4 text-emerald-600" />
            case 'disc_collection':
                return <Disc className="h-4 w-4 text-cyan-600" />
            default:
                return <Target className="h-4 w-4 text-blue-600" />
        }
    }

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Trophy className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Tracked Weekly Activities</h2>
                        <p className="text-sm text-gray-500">Bonus Event + Key Weekly Quests</p>
                    </div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {expanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
            </div>

            {/* Bonus Event This Week - Always Visible */}
            <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-300">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-purple-200 rounded-lg">
                        <Trophy className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-purple-900">{currentBonusEvent.name}</h3>
                            <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                                Active This Week
                            </span>
                        </div>
                        <p className="text-xs text-purple-600 mt-0.5">Complete objectives for bonus rewards</p>
                    </div>
                </div>
                <ul className="space-y-1.5">
                    {currentBonusEvent.objectives.map((objective, index) => (
                        <li key={index} className="text-sm text-purple-800 flex items-start">
                            <span className="text-purple-400 mr-2 flex-shrink-0">•</span>
                            <span>{objective}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Tracked Weekly Quests */}
            {expanded && (
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span>Essential Weekly Quests</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.values(TRACKED_WEEKLY_QUESTS).map((quest) => (
                            <div
                                key={quest.id}
                                className={`rounded-lg border-2 p-4 hover:shadow-md transition-all ${
                                    quest.id === 'world_soul' ? 'bg-amber-50 border-amber-200' :
                                    quest.id === 'delves_weekly' ? 'bg-emerald-50 border-emerald-200' :
                                    'bg-cyan-50 border-cyan-200'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm">{quest.name}</h4>
                                        <p className="text-xs text-gray-600 font-medium mt-0.5">📍 {quest.zone}</p>
                                    </div>
                                    {getQuestIcon(quest.id)}
                                </div>
                                <ul className="space-y-1.5 mt-2">
                                    {quest.objectives.map((objective, index) => (
                                        <li key={index} className="text-xs text-gray-700 flex items-start">
                                            <span className="text-gray-400 mr-1.5 flex-shrink-0">•</span>
                                            <span>{objective}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default WeeklyQuestsSummary

