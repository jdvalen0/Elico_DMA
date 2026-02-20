import * as Minio from 'minio';
import dotenv from 'dotenv';
import { AppError } from '../middleware/errorHandler';

dotenv.config();

export class MinioClient {
  private client: Minio.Client | null = null;
  private bucketName: string;
  private bucketInitialized: boolean = false;

  constructor() {
    // Solo crear cliente si MinIO está habilitado
    const minioEnabled = process.env.MINIO_ENABLED !== 'false';
    
    if (minioEnabled) {
      try {
        this.client = new Minio.Client({
          endPoint: process.env.MINIO_ENDPOINT || 'localhost',
          port: parseInt(process.env.MINIO_PORT || '9000'),
          useSSL: false,
          accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
          secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        });
      } catch (error) {
        console.warn('⚠️  MinIO client initialization failed, file storage will be disabled:', error);
        this.client = null;
      }
    }

    this.bucketName = process.env.MINIO_BUCKET || 'dma-evidence';

    // Inicializar bucket de forma asíncrona sin bloquear
    this.ensureBucket().catch((error) => {
      console.warn('⚠️  MinIO bucket initialization failed:', error.message);
    });
  }

  private async ensureBucket() {
    if (!this.client || this.bucketInitialized) {
      return;
    }

    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
      }
      this.bucketInitialized = true;
    } catch (error: any) {
      console.warn(`⚠️  MinIO not available: ${error.message}`);
      this.client = null;
    }
  }

  private async ensureClient() {
    if (!this.client) {
      throw new AppError(503, 'File storage service is not available. MinIO is not configured or not running.', 'SERVICE_UNAVAILABLE');
    }
    await this.ensureBucket();
  }

  async uploadFile(
    fileName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<void> {
    await this.ensureClient();
    if (!this.client) {
      throw new AppError(503, 'File storage service is not available', 'SERVICE_UNAVAILABLE');
    }
    await this.client.putObject(this.bucketName, fileName, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
  }

  async getFileUrl(fileName: string, expiry: number = 3600): Promise<string> {
    await this.ensureClient();
    if (!this.client) {
      throw new AppError(503, 'File storage service is not available', 'SERVICE_UNAVAILABLE');
    }
    return await this.client.presignedGetObject(this.bucketName, fileName, expiry);
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.ensureClient();
    if (!this.client) {
      throw new AppError(503, 'File storage service is not available', 'SERVICE_UNAVAILABLE');
    }
    await this.client.removeObject(this.bucketName, fileName);
  }
}
