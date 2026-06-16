// Central app config, sourced from env so it can be changed in one place.
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Dance Fit with Emily";
export const DEFAULT_CURRENCY = (process.env.DEFAULT_CURRENCY || "gbp").toLowerCase();

/** Absolute base URL of the app, used to build shareable payment links. */
export function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Build the public join link for a class token. */
export function classUrl(token: string): string {
  return `${baseUrl()}/class/${token}`;
}
