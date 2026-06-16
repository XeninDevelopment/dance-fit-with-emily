// Generates an unguessable, URL-safe token for public payment links.
// Uses Web Crypto so it works in any runtime.
export function generateToken(bytes = 18): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  let binary = "";
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
