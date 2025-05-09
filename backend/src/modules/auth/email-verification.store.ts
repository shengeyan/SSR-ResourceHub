const cache = new Map<string, { code: string; expires: number }>();

export function storeCode(email: string, code: string) {
  cache.set(email, { code, expires: Date.now() + 5 * 60 * 1000 });
}

export function verifyCode(email: string, code: string): boolean {
  const entry = cache.get(email);
  if (!entry) return false;
  const valid = entry.code === code && Date.now() < entry.expires;
  if (valid) cache.delete(email);
  return valid;
}
