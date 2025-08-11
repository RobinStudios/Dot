import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface DesignTemplate {
  id?: string
  name: string
  code: string
  category: string
  created_at?: string
  user_id?: string
}

export class SupabaseClient {
  async saveDesign(template: DesignTemplate, userId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('designs')
        .insert({
          name: template.name,
          code: template.code,
          category: template.category,
          user_id: userId
        })

      return !error
    } catch (error) {
      console.error('Supabase save failed:', error)
      return false
    }
  }

  async getDesigns(userId?: string): Promise<DesignTemplate[]> {
    try {
      let query = supabase.from('designs').select('*')
      
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Supabase fetch failed:', error)
      return []
    }
  }

  async deleteDesign(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', id)

      return !error
    } catch (error) {
      console.error('Supabase delete failed:', error)
      return false
    }
  }
}

export const supabaseClient = new SupabaseClient()