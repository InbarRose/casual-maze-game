/**
 * Casual Maze Game — Cryptographic Hashing Utilities
 * Normalizes text line endings to LF before hashing to ensure 100% deterministic
 * SHA-256 hashes and byte lengths across Windows (CRLF) and Linux / macOS (LF).
 */

import fs from 'fs';
import crypto from 'crypto';

/**
 * Compute SHA-256 hash and byte size of a file with normalized LF line endings
 * @param {string} filePath
 * @returns {{ hash: string, size: number }}
 */
export function computeNormalizedFileHashAndSize(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return computeNormalizedHashAndSize(content);
}

/**
 * Compute SHA-256 hash and byte size of a string or buffer with normalized LF line endings
 * @param {string|Buffer} content
 * @returns {{ hash: string, size: number }}
 */
export function computeNormalizedHashAndSize(content) {
  const text = typeof content === 'string' ? content : content.toString('utf8');
  const normalized = text.replace(/\r\n/g, '\n');
  const buffer = Buffer.from(normalized, 'utf8');
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  return { hash, size: buffer.length };
}
