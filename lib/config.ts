// Central app config, sourced from env so it can be changed in one place.
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Dance Fit with Emily";
export const DEFAULT_CURRENCY = (process.env.DEFAULT_CURRENCY || "gbp").toLowerCase();

/** Public contact + social links — reused in the footer, error states, and legal pages. */
export const CONTACT = {
  email: "dancefitwithemily@outlook.com",
  instagram: "https://www.instagram.com/_dancefitwithemily",
  tiktok: "https://www.tiktok.com/@_dancefitwithemily",
  instagramHandle: "@_dancefitwithemily",
};

/** Where Emily runs classes — used in copy and legal pages. */
export const SERVICE_AREA = "the North West of England";

/** Legal entity behind the site — the data controller and the party customers contract with. */
export const LEGAL_ENTITY = {
  company: "Xenin Ltd",
  address: "3rd Floor, 86-90, Paul Street, London, England, United Kingdom, EC2A 4NE",
};

/** Absolute base URL of the app, used to build shareable payment links. */
export function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Build the public join link for a class token. */
export function classUrl(token: string): string {
  return `${baseUrl()}/class/${token}`;
}

/** Build the private claim link for a waitlist spot offer. */
export function claimUrl(classToken: string, claimToken: string): string {
  return `${baseUrl()}/class/${classToken}/claim/${claimToken}`;
}
