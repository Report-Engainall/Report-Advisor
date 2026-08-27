/**
 * Pure cryptographic file identity primitive.
 *
 * Kept free of application/Supabase imports so Node regression tests can
 * exercise the security primitive without requiring the browser alias graph.
 */
export async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('SHA256_UNAVAILABLE');
  const hash = await globalThis.crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
