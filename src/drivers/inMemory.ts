import { StorageDriver } from '../types';

/** In-memory driver — useful for tests and demos, nothing persists past the process. */
export class InMemoryDriver implements StorageDriver {
  private readonly store = new Map<string, Buffer>();

  async put(key: string, data: Buffer): Promise<void> {
    this.store.set(key, Buffer.from(data));
  }

  async get(key: string): Promise<Buffer> {
    const value = this.store.get(key);
    if (!value) throw new Error(`key not found: ${key}`);
    return value;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}
