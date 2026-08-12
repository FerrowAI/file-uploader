import { StorageDriver } from './types';
import { ValidationOptions, validateFile } from './validate';
import { uniqueFilename } from './filename';
import { sha256 } from './hash';
import { SniffedType } from './sniff';

export interface UploadOptions extends ValidationOptions {
  /** when true, a repeat of the exact same content (by sha256) returns the existing key
   *  instead of storing a duplicate. */
  dedup?: boolean;
}

export interface UploadResult {
  key: string;
  sniffedType: SniffedType;
  hash: string;
  deduped: boolean;
}

/** Storage-agnostic upload pipeline: validate (size + magic-byte type) -> optional
 *  content-hash dedup -> safe unique filename -> driver.put(). No multipart parsing here —
 *  that's your HTTP framework's job; this pipeline takes an already-extracted Buffer. */
export class UploadPipeline {
  private readonly hashIndex = new Map<string, string>();

  constructor(private readonly driver: StorageDriver) {}

  async upload(originalName: string, data: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const validation = validateFile(data, options);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const hash = sha256(data);
    if (options.dedup && this.hashIndex.has(hash)) {
      return { key: this.hashIndex.get(hash) as string, sniffedType: validation.sniffedType, hash, deduped: true };
    }

    const key = uniqueFilename(originalName);
    await this.driver.put(key, data);
    if (options.dedup) this.hashIndex.set(hash, key);

    return { key, sniffedType: validation.sniffedType, hash, deduped: false };
  }
}
