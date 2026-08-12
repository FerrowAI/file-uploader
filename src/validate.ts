import { SniffedType, sniffMimeType } from './sniff';

export interface ValidationOptions {
  maxSizeBytes?: number;
  /** magic-byte types to accept; extension is never trusted. */
  allowedTypes?: Exclude<SniffedType, null>[];
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  sniffedType: SniffedType;
}

export function validateFile(data: Buffer, options: ValidationOptions = {}): ValidationResult {
  if (options.maxSizeBytes !== undefined && data.length > options.maxSizeBytes) {
    return {
      valid: false,
      reason: `file is ${data.length} bytes, exceeds max size of ${options.maxSizeBytes} bytes`,
      sniffedType: sniffMimeType(data),
    };
  }

  const sniffedType = sniffMimeType(data);

  if (options.allowedTypes) {
    if (!sniffedType || !options.allowedTypes.includes(sniffedType)) {
      return {
        valid: false,
        reason: `file content sniffed as "${sniffedType ?? 'unknown'}", not in allowed list [${options.allowedTypes.join(', ')}]`,
        sniffedType,
      };
    }
  }

  return { valid: true, sniffedType };
}
