import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { randomBytes } from 'crypto';
import type { Readable } from 'stream';

/**
 * File storage abstraction. Driver is env-selected: "local" writes to a folder
 * on disk (dev); switch STORAGE_DRIVER=s3 in production with no code change.
 * The rest of the app only depends on this service, never on the driver.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: string;
  private readonly localPath: string;

  constructor(private readonly config: ConfigService) {
    this.driver = this.config.get<string>('storage.driver', 'local');
    this.localPath = this.config.get<string>('storage.localPath', '.storage');
  }

  /** Persist bytes and return an opaque storage key. */
  async save(buffer: Buffer, opportunityId: string, fileName: string): Promise<string> {
    const key = `${opportunityId}/${Date.now()}-${randomBytes(6).toString('hex')}-${sanitize(fileName)}`;
    if (this.driver !== 'local') {
      throw new Error(`Storage driver "${this.driver}" not yet implemented`);
    }
    const full = join(this.localPath, key);
    await fs.mkdir(dirname(full), { recursive: true });
    await fs.writeFile(full, buffer);
    this.logger.log(`Saved ${buffer.length} bytes -> ${key}`);
    return key;
  }

  /** Open a readable stream for a stored object. */
  createReadStream(key: string): Readable {
    const full = join(this.localPath, key);
    return createReadStream(full);
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(join(this.localPath, key));
    } catch (err) {
      this.logger.warn(`Failed to delete ${key}: ${(err as Error).message}`);
    }
  }
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}
