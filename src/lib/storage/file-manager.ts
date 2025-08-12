
import { uploadDesignAsset } from '../aws/s3-client';

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
  userId: string;
  uploadedAt: Date;
}

export class FileManager {
  async uploadFile(file: File, userId: string, folder = 'uploads'): Promise<UploadedFile> {
    // Use AWS S3 for upload
    const designId = userId; // Or use a generated designId if needed
    const url = await uploadDesignAsset(file, designId);
    return {
      url,
      name: file.name,
      size: file.size,
      type: file.type,
      userId,
      uploadedAt: new Date(),
    };
  }

  // Placeholder: Implement file listing using S3 ListObjectsV2 if needed
  async getFiles(userId: string): Promise<UploadedFile[]> {
    // Not implemented: would require S3 ListObjectsV2 and filtering by user prefix
    return [];
  }

  // Placeholder: Implement file deletion using S3 DeleteObject if needed
  async deleteFile(fileUrl: string, userId: string): Promise<void> {
    // Not implemented: would require S3 DeleteObject
    return;
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only image files are allowed' };
    }
    return { valid: true };
  }
}

export const fileManager = new FileManager();