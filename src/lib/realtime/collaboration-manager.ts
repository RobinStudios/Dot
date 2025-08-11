import { supabase } from '@/lib/integrations/supabase-client'

interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'element_update' | 'user_join' | 'user_leave'
  userId: string
  userName: string
  data: any
  timestamp: number
}

interface Cursor {
  userId: string
  userName: string
  x: number
  y: number
  color: string
}

export class CollaborationManager {
  private roomId: string
  private userId: string
  private userName: string
  private channel: any
  private cursors: Map<string, Cursor> = new Map()
  private onCursorUpdate?: (cursors: Cursor[]) => void
  private onElementUpdate?: (data: any) => void
  private onUserUpdate?: (users: string[]) => void

  constructor(roomId: string, userId: string, userName: string) {
    this.roomId = roomId
    this.userId = userId
    this.userName = userName
  }

  async connect(): Promise<void> {
    this.channel = supabase.channel(`room:${this.roomId}`)
      .on('broadcast', { event: 'collaboration' }, (payload) => {
        this.handleCollaborationEvent(payload.payload as CollaborationEvent)
      })
      .subscribe()

    this.broadcast({
      type: 'user_join',
      userId: this.userId,
      userName: this.userName,
      data: {},
      timestamp: Date.now()
    })
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      this.broadcast({
        type: 'user_leave',
        userId: this.userId,
        userName: this.userName,
        data: {},
        timestamp: Date.now()
      })
      
      await supabase.removeChannel(this.channel)
    }
  }

  updateCursor(x: number, y: number): void {
    this.broadcast({
      type: 'cursor',
      userId: this.userId,
      userName: this.userName,
      data: { x, y },
      timestamp: Date.now()
    })
  }

  updateElement(elementId: string, changes: any): void {
    this.broadcast({
      type: 'element_update',
      userId: this.userId,
      userName: this.userName,
      data: { elementId, changes },
      timestamp: Date.now()
    })
  }

  private broadcast(event: CollaborationEvent): void {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'collaboration',
        payload: event
      })
    }
  }

  private handleCollaborationEvent(event: CollaborationEvent): void {
    if (event.userId === this.userId) return

    switch (event.type) {
      case 'cursor':
        this.cursors.set(event.userId, {
          userId: event.userId,
          userName: event.userName,
          x: event.data.x,
          y: event.data.y,
          color: this.getUserColor(event.userId)
        })
        this.onCursorUpdate?.(Array.from(this.cursors.values()))
        break

      case 'element_update':
        this.onElementUpdate?.(event.data)
        break

      case 'user_join':
        this.onUserUpdate?.(Array.from(this.cursors.keys()).concat(event.userId))
        break

      case 'user_leave':
        this.cursors.delete(event.userId)
        this.onCursorUpdate?.(Array.from(this.cursors.values()))
        break
    }
  }

  private getUserColor(userId: string): string {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  onCursorsUpdate(callback: (cursors: Cursor[]) => void): void {
    this.onCursorUpdate = callback
  }

  onElementsUpdate(callback: (data: any) => void): void {
    this.onElementUpdate = callback
  }

  onUsersUpdate(callback: (users: string[]) => void): void {
    this.onUserUpdate = callback
  }
}

export const createCollaborationManager = (roomId: string, userId: string, userName: string) => 
  new CollaborationManager(roomId, userId, userName)