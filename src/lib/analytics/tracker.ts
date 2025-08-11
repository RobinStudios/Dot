import { supabase } from '@/lib/integrations/supabase-client'

interface AnalyticsEvent {
  event: string
  userId?: string
  properties: Record<string, any>
  timestamp: Date
}

export class AnalyticsTracker {
  private userId?: string
  private sessionId: string

  constructor(userId?: string) {
    this.userId = userId
    this.sessionId = this.generateSessionId()
  }

  async track(event: string, properties: Record<string, any> = {}): Promise<void> {
    const eventData: AnalyticsEvent = {
      event,
      userId: this.userId,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    }

    try {
      await supabase
        .from('analytics_events')
        .insert({
          event: eventData.event,
          user_id: eventData.userId,
          properties: eventData.properties,
          session_id: this.sessionId,
          created_at: eventData.timestamp.toISOString()
        })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }

  async trackPageView(page: string): Promise<void> {
    await this.track('page_view', { page })
  }

  async trackDesignAction(action: string, designId?: string, elementType?: string): Promise<void> {
    await this.track('design_action', { action, designId, elementType })
  }

  async trackAIUsage(provider: string, feature: string, success: boolean): Promise<void> {
    await this.track('ai_usage', { provider, feature, success })
  }

  async trackCollaboration(action: string, roomId: string, participantCount: number): Promise<void> {
    await this.track('collaboration', { action, roomId, participantCount })
  }

  async trackExport(format: string, templateId: string): Promise<void> {
    await this.track('export', { format, templateId })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string): void {
    this.userId = userId
  }
}

export const analytics = new AnalyticsTracker()