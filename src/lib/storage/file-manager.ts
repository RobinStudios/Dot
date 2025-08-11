import { supabase } from '@/lib/integrations/supabase-client'

export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  userId: string
  createdAt: Date
}

export class FileManager {
  private bucket = 'design-assets'

  async uploadFile(file: File, userId: string, folder = 'uploads'): Promise<UploadedFile> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(fileName, file)

    if (error) throw new Error(`Upload failed: ${error.message}`)

    const { data: { publicUrl } } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName)

    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        path: fileName,
        url: publicUrl,
        size: file.size,
        type: file.type,
        user_id: userId
      })
      .select()
      .single()

    if (dbError) throw new Error(`Database error: ${dbError.message}`)

    return {
      id: fileRecord.id,
      name: fileRecord.name,
      url: fileRecord.url,
      size: fileRecord.size,
      type: fileRecord.type,
      userId: fileRecord.user_id,
      createdAt: new Date(fileRecord.created_at)
    }
  }

  async getFiles(userId: string): Promise<UploadedFile[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Fetch failed: ${error.message}`)

    return data.map(file => ({
      id: file.id,
      name: file.name,
      url: file.url,
      size: file.size,
      type: file.type,
      userId: file.user_id,
      createdAt: new Date(file.created_at)
    }))
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('path')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single()

    if (fetchError) throw new Error('File not found')

    const { error: storageError } = await supabase.storage
      .from(this.bucket)
      .remove([file.path])

    if (storageError) throw new Error(`Storage deletion failed: ${storageError.message}`)

    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId)

    if (dbError) throw new Error(`Database deletion failed: ${dbError.message}`)
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only image files are allowed' }
    }

    return { valid: true }
  }
}

export const fileManager = new FileManager()