import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageDriver } from '../types';

/** Real filesystem-backed driver. Every key is resolved and checked to stay inside
 *  `rootDir` before any fs call — this is what makes it traversal-safe. */
export class LocalDiskDriver implements StorageDriver {
  constructor(private readonly rootDir: string) {}

  private resolveSafe(key: string): string {
    const rootResolved = path.resolve(this.rootDir);
    const resolved = path.resolve(rootResolved, key);
    if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
      throw new Error(`unsafe key "${key}" resolves outside the storage root`);
    }
    return resolved;
  }

  async put(key: string, data: Buffer): Promise<void> {
    const filePath = this.resolveSafe(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
  }

  async get(key: string): Promise<Buffer> {
    return fs.readFile(this.resolveSafe(key));
  }

  async delete(key: string): Promise<void> {
    await fs.rm(this.resolveSafe(key), { force: true });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolveSafe(key));
      return true;
    } catch {
      return false;
    }
  }
}
