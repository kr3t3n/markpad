import pako from 'pako'

// Maximum URL-safe payload size (conservative for Safari compatibility)
const MAX_PAYLOAD_BYTES = 60_000

export type ShareError = 'too-large' | 'wrong-password' | 'corrupted'

// ---- Base64url helpers (URL-safe, no padding) ----

function toBase64url(buf: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = (4 - (base64.length % 4)) % 4
  const padded = base64 + '='.repeat(pad)
  const binary = atob(padded)
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
  return buf
}

// ---- Key derivation ----

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

// ---- Public API ----

/**
 * Compress and encrypt markdown content with a password.
 * Returns a URL-safe payload string: `<salt>.<iv>.<ciphertext>` (all base64url).
 * Throws `'too-large'` if the result exceeds URL limits.
 */
export async function compressAndEncrypt(markdown: string, password: string): Promise<string> {
  // 1. Compress
  const compressed = pako.deflate(new TextEncoder().encode(markdown))

  // 2. Generate random salt + IV
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // 3. Derive key from password
  const key = await deriveKey(password, salt)

  // 4. Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    compressed as BufferSource,
  )

  // 5. Encode
  const payload = [
    toBase64url(salt),
    toBase64url(iv),
    toBase64url(new Uint8Array(encrypted)),
  ].join('.')

  // 6. Size check
  if (payload.length > MAX_PAYLOAD_BYTES) {
    throw 'too-large' as ShareError
  }

  return payload
}

/**
 * Decrypt and decompress a payload string with a password.
 * Returns the original markdown string.
 * Throws `'wrong-password'` or `'corrupted'` on failure.
 */
export async function decryptAndDecompress(payload: string, password: string): Promise<string> {
  let salt: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array

  try {
    const parts = payload.split('.')
    if (parts.length !== 3) throw new Error('bad format')
    salt = fromBase64url(parts[0])
    iv = fromBase64url(parts[1])
    ciphertext = fromBase64url(parts[2])
  } catch {
    throw 'corrupted' as ShareError
  }

  try {
    const key = await deriveKey(password, salt)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      ciphertext as BufferSource,
    )
    const decompressed = pako.inflate(new Uint8Array(decrypted))
    return new TextDecoder().decode(decompressed)
  } catch {
    throw 'wrong-password' as ShareError
  }
}

/**
 * Estimate whether a markdown string will fit in a share URL.
 * Returns the approximate word count limit info.
 */
export function estimateShareSize(markdown: string): {
  fits: boolean
  compressedBytes: number
  wordCount: number
} {
  const compressed = pako.deflate(new TextEncoder().encode(markdown))
  // Rough estimate: encrypted + base64 overhead is ~37% larger than compressed
  const estimatedPayload = Math.ceil(compressed.length * 1.37) + 50 // +50 for salt.iv overhead
  const wordCount = markdown.split(/\s+/).filter(Boolean).length
  return {
    fits: estimatedPayload <= MAX_PAYLOAD_BYTES,
    compressedBytes: compressed.length,
    wordCount,
  }
}
