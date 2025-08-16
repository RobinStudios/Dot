'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './auth-provider'

interface CollaboratorType {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline'
  cursor?: { x: number; y: number }
}

export default CollaborationPanel;

interface CommentType {
  id: string
  user: string
  avatar: string
  text: string
  timestamp: Date
  x: number
  y: number
}

export function CollaborationPanel() {
  const { user } = useAuth()
  const [collaborators, setCollaborators] = useState<CollaboratorType[]>([])
  const [comments, setComments] = useState<CommentType[]>([])
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Simulate real-time collaborators
    const mockCollaborators: CollaboratorType[] = [
      {
        id: '1',
        name: 'Alice Designer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        status: 'online',
        cursor: { x: 150, y: 200 }
      },
      {
        id: '2',
        name: 'Bob Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        status: 'online',
        cursor: { x: 300, y: 150 }
      }
    ]
    setCollaborators(mockCollaborators)

    // Simulate existing comments
    setComments([
      {
        id: '1',
        user: 'Alice Designer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        text: 'Love this color scheme!',
        timestamp: new Date(Date.now() - 300000),
        x: 200,
        y: 100
      }
    ])
  }, [])

  const addComment = (text: string) => {
    if (!user || !text.trim()) return

    const newComment: CommentType = {
      id: Date.now().toString(),
      user: user.name,
      avatar: user.avatar || '',
      text: text.trim(),
      timestamp: new Date(),
      x: commentPosition.x,
      y: commentPosition.y
    }

    setComments(prev => [...prev, newComment])
    setIsCommenting(false)
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      setCommentPosition({ x: e.clientX, y: e.clientY })
      setIsCommenting(true)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Collaborators List */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--clay-gray)' }}>
        <h3 className="font-semibold mb-3">Collaborators ({collaborators.length + 1})</h3>
        <div className="space-y-2">
          {/* Current User */}
          {user && (
            <div className="flex items-center gap-2">
              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
              <span className="text-sm">{user.name} (You)</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}
          
          {/* Other Collaborators */}
          {collaborators.map(collaborator => (
            <div key={collaborator.id} className="flex items-center gap-2">
              <img src={collaborator.avatar} alt={collaborator.name} className="w-6 h-6 rounded-full" />
              <span className="text-sm">{collaborator.name}</span>
              <div className={`w-2 h-2 rounded-full ${
                collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Comments ({comments.length})</h3>
          <button 
            onClick={() => setIsCommenting(true)}
            className="text-xs ai-chip"
          >
            + Add Comment
          </button>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2">
              <img src={comment.avatar} alt={comment.user} className="w-6 h-6 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{comment.user}</span>
                  <span className="text-xs opacity-60">
                    {comment.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm opacity-80">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Cursors Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {collaborators.map(collaborator => 
          collaborator.cursor && (
            <div
              key={collaborator.id}
              className="absolute pointer-events-none"
              style={{
                left: collaborator.cursor.x,
                top: collaborator.cursor.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded whitespace-nowrap">
                  {collaborator.name}
                </span>
              </div>
            </div>
          )
        )}
      </div>

      {/* Comment Input Modal */}
      {isCommenting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80" style={{ background: 'var(--graphite-mist)' }}>
            <h4 className="font-semibold mb-3">Add Comment</h4>
            <textarea
              placeholder="Type your comment..."
              className="w-full p-2 rounded border resize-none"
              style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  addComment(e.currentTarget.value)
                }
              }}
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button 
                onClick={(e) => {
                  const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement
                  addComment(textarea?.value || '')
                }}
                className="btn-primary text-sm"
              >
                Add Comment
              </button>
              <button 
                onClick={() => setIsCommenting(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}