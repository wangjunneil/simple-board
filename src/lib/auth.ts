const ALGORITHM = "HMAC";
const HASH = "SHA-256";
const COOKIE_NAME = "sb-auth";
const SESSION_MINUTES = 30;

async function getKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(password);
  return crypto.subtle.importKey("raw", keyData, { name: ALGORITHM, hash: HASH }, false, ["sign", "verify"]);
}

export async function getServerDeviceId(): Promise<string> {
  const pw = process.env.ACCESS_PASSWORD || "simpleboard";
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(pw));
  const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  return "nb-" + hex.slice(0, 16);
}

export async function signToken(password: string): Promise<string> {
  const ts = Date.now().toString();
  const enc = new TextEncoder();
  const key = await getKey(password);
  const sig = await crypto.subtle.sign(ALGORITHM, key, enc.encode(ts));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${ts}.${sigHex}`;
}

export async function verifyToken(token: string, password: string): Promise<boolean> {
  try {
    const [ts, sigHex] = token.split(".");
    if (!ts || !sigHex) return false;

    const now = Date.now();
    const tokenTime = parseInt(ts, 10);
    if (isNaN(tokenTime)) return false;
    if (now - tokenTime > SESSION_MINUTES * 60 * 1000) return false;

    const enc = new TextEncoder();
    const key = await getKey(password);

    const sigBytes = new Uint8Array(sigHex.length / 2);
    for (let i = 0; i < sigHex.length; i += 2) {
      sigBytes[i / 2] = parseInt(sigHex.substring(i, i + 2), 16);
    }

    return crypto.subtle.verify(ALGORITHM, key, sigBytes, enc.encode(ts));
  } catch {
    return false;
  }
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

export function getCookieValue(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MINUTES * 60}`;
}
