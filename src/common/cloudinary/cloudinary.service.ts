import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

// Cloudinary / Almacenara las imagenes pdf / Dandole uso en el plan gratuito

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new Error('No se proporciono un archivo');
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: `asescon/${folder}`, resource_type: 'auto', type: 'upload' },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(new Error(error.message));

          if (!result) {
            return reject(new Error('Upload failed: no result returned'));
          }

          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async deleteFile(publicId: string): Promise<{ result: string }> {
    return cloudinary.uploader.destroy(publicId);
  }

  // Helper para extraer el public_id de la URL de Cloudinary
  // Para evitar fallos en subcarpetas o con versiones en la URL
  extractPublicId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;

      const parts = path.split('/');
      const uploadIndex = parts.findIndex((p) => p === 'upload');

      if (uploadIndex === -1) return null;

      const publicIdWithVersion = parts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithVersion.replace(/\.[^/.]+$/, '');

      return publicId;
    } catch {
      return null;
    }
  }
}
