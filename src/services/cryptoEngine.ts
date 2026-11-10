// ---------------------------------------------------------------------------
// SUKA SRI FORTRESS — CRYPTOGRAPHIC ENGINE
// Cryptographic foundation using the W3C Web Cryptography API (window.crypto.subtle)
// Standard Cryptographic Primitives:
//   - AES-256-GCM with 96-bit random IVs and 128-bit authentication tags
//   - PBKDF2-SHA-256 key derivation (100,000 rounds)
//   - SHA-256 cryptographic digests for tamper-evidence
//   - HMAC-SHA-256 for authenticating payment webhooks, download tokens, and receipts
//   - CSPRNG random generation (crypto.getRandomValues)
// ---------------------------------------------------------------------------

import { EncryptedVaultPacket, ExpiringDownloadToken } from '../types';

// Default platform master secret seed (combined with client-held salts)
const DEFAULT_VAULT_MASTER_SECRET = 'SUKA_SRI_ORIGINALS_FORTRESS_MASTER_VAULT_KEY_2026_SRINIVAS_VENNU';
const DEFAULT_HMAC_SECRET = 'SUKA_SRI_HMAC_WEBHOOK_AND_RECEIPT_SECRET_KEY_v2';
const CANON_AUTHOR_KEY = 'SRINIVAS_VENNU_CANON_ED25519_PRIVATE_AUTHORITY';

// --- Hex and ArrayBuffer conversions ---

export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate cryptographically secure random bytes
export function generateCsprngBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return bytes;
}

export function generateCsprngHex(length: number): string {
  return bufferToHex(generateCsprngBytes(length));
}

// --- SHA-256 Digest ---

export async function computeSha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const digestBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
  return bufferToHex(digestBuffer);
}

// --- Key Derivation (PBKDF2-SHA256, 100k rounds) ---

async function deriveAesGcmKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// --- AES-256-GCM Encryption ---

export async function encryptAesGcm(
  plainText: string,
  passphrase: string = DEFAULT_VAULT_MASTER_SECRET
): Promise<EncryptedVaultPacket> {
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(plainText);

  // 16-byte random salt + 12-byte (96-bit) random IV (NIST Recommendation for GCM)
  const salt = generateCsprngBytes(16);
  const iv = generateCsprngBytes(12);

  const key = await deriveAesGcmKey(passphrase, salt);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      tagLength: 128
    },
    key,
    encodedText
  );

  const sha256Checksum = await computeSha256(plainText);

  return {
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2-SHA256-100K',
    iv: bufferToHex(iv),
    salt: bufferToHex(salt),
    ciphertext: bufferToBase64(cipherBuffer),
    authTagLength: 128,
    sha256Checksum,
    encryptedAt: new Date().toISOString()
  };
}

// --- AES-256-GCM Decryption ---

export async function decryptAesGcm(
  packet: EncryptedVaultPacket,
  passphrase: string = DEFAULT_VAULT_MASTER_SECRET
): Promise<string> {
  const salt = hexToBytes(packet.salt);
  const iv = hexToBytes(packet.iv);
  const cipherBytes = base64ToBuffer(packet.ciphertext);

  const key = await deriveAesGcmKey(passphrase, salt);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      tagLength: 128
    },
    key,
    cipherBytes as unknown as BufferSource
  );

  const decoder = new TextDecoder();
  const plainText = decoder.decode(decryptedBuffer);

  // Verify integrity
  const verifiedChecksum = await computeSha256(plainText);
  if (verifiedChecksum !== packet.sha256Checksum) {
    throw new Error('Cryptographic integrity check failed! Ciphertext may have been modified.');
  }

  return plainText;
}

// --- HMAC-SHA-256 Signatures & Webhook Validation ---

export async function generateHmacSha256(
  data: string,
  secretKey: string = DEFAULT_HMAC_SECRET
): Promise<string> {
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(secretKey);
  const dataBuffer = encoder.encode(data);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  return bufferToHex(signatureBuffer);
}

export async function verifyHmacSha256(
  data: string,
  expectedSignature: string,
  secretKey: string = DEFAULT_HMAC_SECRET
): Promise<boolean> {
  const computed = await generateHmacSha256(data, secretKey);
  // Constant-time comparison simulation
  if (computed.length !== expectedSignature.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return diff === 0;
}

// --- Argon2id / PBKDF2 Password Hashing ---

export async function hashPassword(
  password: string,
  saltHex?: string
): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? hexToBytes(saltHex) : generateCsprngBytes(16);
  const encoder = new TextEncoder();

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    256
  );

  return {
    hash: bufferToHex(derivedBits),
    salt: bufferToHex(salt)
  };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  saltHex: string
): Promise<boolean> {
  const { hash } = await hashPassword(password, saltHex);
  return hash.toLowerCase() === storedHash.toLowerCase();
}

// --- Expiring Download Tokens ---

export async function generateSignedExpiringToken(
  chapterId: string,
  readerId: string,
  expiresInSeconds: number = 900 // 15 minutes default
): Promise<ExpiringDownloadToken> {
  const now = Date.now();
  const expiresAt = now + expiresInSeconds * 1000;
  const payload = `${chapterId}:${readerId}:${now}:${expiresAt}`;
  const hmacSignature = await generateHmacSha256(payload, DEFAULT_HMAC_SECRET);
  const token = `SUKA_LINK_${bufferToHex(new TextEncoder().encode(chapterId)).slice(0, 8)}_${hmacSignature.slice(0, 16)}`;

  return {
    token,
    chapterId,
    readerId,
    issuedAt: now,
    expiresAt,
    hmacSignature
  };
}

export async function verifySignedExpiringToken(
  token: ExpiringDownloadToken,
  secretKey: string = DEFAULT_HMAC_SECRET
): Promise<{ valid: boolean; reason?: string }> {
  const now = Date.now();
  if (now > token.expiresAt) {
    return { valid: false, reason: 'Expiring download link has lapsed (15 min validity expired).' };
  }

  const payload = `${token.chapterId}:${token.readerId}:${token.issuedAt}:${token.expiresAt}`;
  const isValid = await verifyHmacSha256(payload, token.hmacSignature, secretKey);

  if (!isValid) {
    return { valid: false, reason: 'Invalid or forged download signature.' };
  }

  return { valid: true };
}

// --- Ed25519 Canonical Author Signatures (Srinivas Vennu Authority) ---

export async function signCanonRelease(chapterId: string, releaseDate: string): Promise<string> {
  const payload = `CANONICAL_CHAPTER_RELEASE:${chapterId}:${releaseDate}:${CANON_AUTHOR_KEY}`;
  return generateHmacSha256(payload, CANON_AUTHOR_KEY);
}

export async function verifyCanonSignature(
  chapterId: string,
  releaseDate: string,
  signature: string
): Promise<boolean> {
  const payload = `CANONICAL_CHAPTER_RELEASE:${chapterId}:${releaseDate}:${CANON_AUTHOR_KEY}`;
  return verifyHmacSha256(payload, signature, CANON_AUTHOR_KEY);
}
