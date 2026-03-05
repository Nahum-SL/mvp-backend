import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
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

  async uploadFile(file: Express.Multer.File, folder: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: `asescon/${folder}`, resource_type: 'auto' },
        (error, result) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
  async deleteFile(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }

  // Helper para extraer el public_id de la URL de Cloudinary
  extractPublicId(url: string): string | null {
    // Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234/blog/nombre-imagen.jpg
    // El public_id sería "blog/nombre-imagen"
    const parts = url.split('/');
    const fileName = parts.pop(); // nombre-imagen.jpg
    const folder = parts.pop(); // blog
    if (!fileName || !folder) return null;

    const [id] = fileName.split('.'); // nombre-imagen
    return `${folder}/${id}`;
  }
}
