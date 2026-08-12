import * as crypto from 'crypto';
import * as path from 'path';

/** Strips any directory components (defeats traversal) and restricts characters. */
export function sanitizeFilename(name: string): string {
  const base = path.basename(name);
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '');
  return cleaned || 'file';
}

/** Sanitized filename + a random suffix, so concurrent uploads never collide. */
export function uniqueFilename(originalName: string): string {
  const safe = sanitizeFilename(originalName);
  const ext = path.extname(safe);
  const base = safe.slice(0, safe.length - ext.length) || 'file';
  const suffix = crypto.randomBytes(8).toString('hex');
  return `${base}-${suffix}${ext}`;
}
