import React, { useMemo } from 'react'
import { Target, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Trophy, Swords } from 'lucide-react'
import { WEEKLY_QUESTS, BONUS_EVENTS, BONUS_EVENT_REFERENCE_DATE } from '../../../shared/constants'

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

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Weekly Quests & Activities</h2>
                        <p className="text-sm text-gray-500">Available weekly content to complete</p>
                    </div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {expanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
            </div>

            {/* Bonus Event This Week */}
            <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    <div>
                        <h3 className="font-semibold text-purple-900">This Week's Bonus Event</h3>
                        <p className="text-sm text-purple-700">{currentBonusEvent.name}</p>
                    </div>
                </div>
                <ul className="space-y-1">
                    {currentBonusEvent.objectives.map((objective, index) => (
                        <li key={index} className="text-sm text-purple-800 flex items-start space-x-2">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span>{objective}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Static Weekly Quests */}
            {expanded && (
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                        <Swords className="h-4 w-4 text-blue-500" />
                        <span>The War Within Weekly Quests</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.values(WEEKLY_QUESTS).map((quest) => (
                            <div
                                key={quest.id}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm">{quest.name}</h4>
                                        <p className="text-xs text-blue-600 font-medium mt-0.5">{quest.zone}</p>
                                    </div>
                                    <Target className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                                </div>
                                <ul className="space-y-1">
                                    {quest.objectives.map((objective, index) => (
                                        <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                                            <span className="text-gray-400 mt-0.5">•</span>
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

