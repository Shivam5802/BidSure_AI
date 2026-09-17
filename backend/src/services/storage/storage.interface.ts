/**
 * Storage Service Abstraction for BidGuard AI
 * Supports S3-compatible storage or localized fallback.
 */

export interface StorageUploadResult {
  key: string;
  size: number;
  mimeType?: string;
  url?: string;
}

export interface StorageService {
  /**
   * Upload binary data to secure storage
   */
  upload(
    key: string,
    data: Buffer | Uint8Array,
    mimeType?: string
  ): Promise<StorageUploadResult>;

  /**
   * Download binary data by key
   */
  download(key: string): Promise<Buffer>;

  /**
   * Delete stored object by key
   */
  delete(key: string): Promise<void>;

  /**
   * Check if object exists in storage
   */
  exists(key: string): Promise<boolean>;

  /**
   * Generate secure presigned URL for temporary access
   */
  getPresignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

/**
 * In-memory storage implementation for testing and development in Phase 0
 */
export class InMemoryStorageService implements StorageService {
  private storage = new Map<string, { data: Buffer; mimeType?: string }>();

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    mimeType?: string
  ): Promise<StorageUploadResult> {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    this.storage.set(key, { data: buffer, mimeType });
    return {
      key,
      size: buffer.byteLength,
      mimeType,
      url: `/mock-storage/${key}`,
    };
  }

  async download(key: string): Promise<Buffer> {
    const item = this.storage.get(key);
    if (!item) {
      throw new Error(`Storage item not found: ${key}`);
    }
    return item.data;
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (!this.storage.has(key)) {
      throw new Error(`Storage item not found: ${key}`);
    }
    return `https://storage.bidguard.internal/${key}?expires=${expiresInSeconds}`;
  }
}
