'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Vote {
  mockupId: string
  userId: string
  userName: string
  timestamp: Date
}

interface VotingStats {
  mockupId: string
  votes: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

interface CollaborativeVotingProps {
  mockups: any[]
  teamId: string
  userId: string
  userName: string
}

export function CollaborativeVoting({ mockups, teamId, userId, userName }: CollaborativeVotingProps) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<VotingStats[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    calculateStats()
  }, [votes, mockups])

  const handleVote = async (mockupId: string) => {
    if (userVotes.has(mockupId)) {
      // Remove vote
      const newVotes = votes.filter(v => !(v.mockupId === mockupId && v.userId === userId))
      setVotes(newVotes)
      setUserVotes(prev => {
        const updated = new Set(prev)
        updated.delete(mockupId)
        return updated
      })
    } else {
      // Add vote
      const newVote: Vote = {
        mockupId,
        userId,
        userName,
        timestamp: new Date()
      }
      setVotes(prev => [...prev, newVote])
      setUserVotes(prev => new Set([...prev, mockupId]))
    }

    // In real app, sync with backend
    await syncVoteWithBackend(mockupId, !userVotes.has(mockupId))
  }

  const calculateStats = () => {
    const totalVotes = votes.length
    const mockupVotes = mockups.map(mockup => {
      const mockupVoteCount = votes.filter(v => v.mockupId === mockup.id).length
      return {
        mockupId: mockup.id,
        votes: mockupVoteCount,
        percentage: totalVotes > 0 ? (mockupVoteCount / totalVotes) * 100 : 0,
        trend: calculateTrend(mockup.id)
      }
    })
    setStats(mockupVotes)
  }

  const calculateTrend = (mockupId: string): 'up' | 'down' | 'stable' => {
    const recentVotes = votes
      .filter(v => v.mockupId === mockupId)
      .filter(v => Date.now() - v.timestamp.getTime() < 300000) // Last 5 minutes
    
    if (recentVotes.length > 2) return 'up'
    if (recentVotes.length === 0) return 'down'
    return 'stable'
  }

  const syncVoteWithBackend = async (mockupId: string, isVote: boolean) => {
    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mockupId,
          userId,
          userName,
          teamId,
          action: isVote ? 'vote' : 'unvote'
        })
      })
    } catch (error) {
      console.error('Vote sync failed:', error)
    }
  }

  const getTopVoted = () => {
    return stats
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3)
      .map(stat => ({
        ...mockups.find(m => m.id === stat.mockupId),
        ...stat
      }))
  }

  return (
    <div className="space-y-4">
      {/* Voting Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Voting</h3>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
        >
          {showAnalytics ? 'Hide' : 'Show'} Analytics
        </button>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
        >
          <h4 className="font-medium mb-3">Real-time Voting Analytics</h4>
          
          {/* Top Voted */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-600 mb-2">Top 3 Favorites</h5>
            <div className="space-y-2">
              {getTopVoted().map((mockup, index) => (
                <div key={mockup.id} className="flex items-center space-x-3">
                  <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Design {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{mockup.votes} votes</span>
                        <span className={`text-xs ${
                          mockup.trend === 'up' ? 'text-green-500' : 
                          mockup.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {mockup.trend === 'up' ? '↗️' : mockup.trend === 'down' ? '↘️' : '→'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${mockup.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voting Activity */}
          <div>
            <h5 className="text-sm font-medium text-gray-600 mb-2">Recent Activity</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {votes.slice(-5).reverse().map((vote, index) => (
                <div key={index} className="text-xs text-gray-500 flex items-center space-x-2">
                  <span>👤</span>
                  <span>{vote.userName} voted for Design {mockups.findIndex(m => m.id === vote.mockupId) + 1}</span>
                  <span>{new Date(vote.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Voting Interface */}
      <div className="text-sm text-gray-600 mb-2">
        Click ❤️ to vote for your favorites (you can vote for multiple designs)
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockups.map((mockup, index) => {
          const mockupStats = stats.find(s => s.mockupId === mockup.id)
          const isVoted = userVotes.has(mockup.id)
          
          return (
            <div key={mockup.id} className="relative bg-white dark:bg-gray-800 rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Design {index + 1}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {mockupStats?.votes || 0} votes
                  </span>
                  {mockupStats?.trend && (
                    <span className={`text-xs ${
                      mockupStats.trend === 'up' ? 'text-green-500' : 
                      mockupStats.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {mockupStats.trend === 'up' ? '↗️' : mockupStats.trend === 'down' ? '↘️' : '→'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                <span className="text-gray-400">Mockup Preview</span>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleVote(mockup.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    isVoted 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{isVoted ? '❤️' : '🤍'}</span>
                  <span>{isVoted ? 'Voted' : 'Vote'}</span>
                </button>
                
                {mockupStats && mockupStats.percentage > 0 && (
                  <div className="text-xs text-gray-500">
                    {mockupStats.percentage.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}