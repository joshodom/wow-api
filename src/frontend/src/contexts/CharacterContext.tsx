import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import axios from 'axios'
import { CharacterProgress, WeeklyActivity } from '../../../shared/types'
import { useAuth } from './AuthContext'
import { WEEKLY_ACTIVITIES } from '../../../shared/constants'

interface CharacterContextType {
    characters: CharacterProgress[]
    selectedCharacter: CharacterProgress | null
    setSelectedCharacter: (character: CharacterProgress | null) => void
    refreshCharacterData: (characterId: number) => Promise<void>
    isLoading: boolean
    error: string | null
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

export const useCharacter = () => {
    const context = useContext(CharacterContext)
    if (context === undefined) {
        throw new Error('useCharacter must be used within a CharacterProvider')
    }
    return context
}

interface CharacterProviderProps {
    children: ReactNode
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
    const { user, token } = useAuth()
    const [characters, setCharacters] = useState<CharacterProgress[]>([])
    const [selectedCharacter, setSelectedCharacter] = useState<CharacterProgress | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadCharacterData = useCallback(async () => {
        if (!user || !token) return

        setIsLoading(true)
        setError(null)

        try {
            // First, get the character list from the API
            const response = await axios.get('/api/characters', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const characters = response.data.characters || []
            console.log('Loaded characters from API:', characters)

            // Convert Blizzard characters to CharacterProgress format
            const characterProgress: CharacterProgress[] = characters.map((char: any) => {
                // Generate default weekly activities for this character
                const defaultActivities: WeeklyActivity[] = WEEKLY_ACTIVITIES ? Object.values(WEEKLY_ACTIVITIES).map(activity => ({
                    id: `${char.id}_${activity.id}`,
                    name: activity.name || 'Unknown Activity',
                    type: activity.type || 'QUEST',
                    description: activity.description || 'No description available',
                    completed: false,
                    progress: 0,
                    maxProgress: 1,
                    resetDay: activity.resetDay || 'TUESDAY'
                })) : [];

                return {
                    characterId: char.id,
                    characterName: char.name || 'Unknown',
                    realm: char.realm?.slug || 'Unknown',
                    race: char.playable_race?.name?.en_US || 'Unknown',
                    className: char.playable_class?.name?.en_US || 'Unknown',
                    level: char.level || 0,
                    faction: char.faction?.type || 'UNKNOWN',
                    activities: defaultActivities,
                    lastUpdated: new Date()
                };
            })

            setCharacters(characterProgress)
            console.log('Set characters:', characterProgress)

            // Set first character as selected by default
            if (characterProgress.length > 0 && !selectedCharacter) {
                setSelectedCharacter(characterProgress[0])
            }
        } catch (error) {
            console.error('Failed to load character data:', error)
            setError('Failed to load character data')
        } finally {
            setIsLoading(false)
        }
    }, [user, token])

    useEffect(() => {
        if (user && token) {
            loadCharacterData()
        }
    }, [user, token, loadCharacterData])

    const refreshCharacterData = async (characterId: number) => {
        if (!token) return

        try {
            setIsLoading(true)
            const response = await axios.get(`/api/characters/${characterId}/progress`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const updatedProgress = response.data.progress

            setCharacters(prev =>
                prev.map(char =>
                    char.characterId === characterId ? updatedProgress : char
                )
            )

            if (selectedCharacter?.characterId === characterId) {
                setSelectedCharacter(updatedProgress)
            }
        } catch (error) {
            console.error(`Failed to refresh character ${characterId}:`, error)
            setError(`Failed to refresh character data`)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const value: CharacterContextType = {
        characters,
        selectedCharacter,
        setSelectedCharacter,
        refreshCharacterData,
        isLoading,
        error
    }

    return (
        <CharacterContext.Provider value={value}>
            {children}
        </CharacterContext.Provider>
    )
}
