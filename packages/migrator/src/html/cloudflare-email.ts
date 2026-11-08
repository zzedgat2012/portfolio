import { ValidationError } from '@portfolio/contracts';

const HEX_PATTERN = /^(?:[0-9a-f]{2})+$/i;

/**
 * Decodes Cloudflare's email obfuscation (`data-cfemail="…"` and
 * `/cdn-cgi/l/email-protection#…`): the first byte is an XOR key for the remaining bytes, and the
 * resulting bytes are UTF-8.
 */
export function decodeCloudflareEmail(hex: string): string {
  if (!HEX_PATTERN.test(hex) || hex.length < 4) {
    throw new ValidationError(`Not a Cloudflare-encoded email: "${hex}"`);
  }
  const key = Number.parseInt(hex.slice(0, 2), 16);
  const bytes: number[] = [];
  for (let index = 2; index < hex.length; index += 2) {
    bytes.push(Number.parseInt(hex.slice(index, index + 2), 16) ^ key);
  }
  return new TextDecoder().decode(Uint8Array.from(bytes));
}
