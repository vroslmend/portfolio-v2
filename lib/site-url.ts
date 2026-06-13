/**
 * Canonical site origin, resolved in priority order:
 *   1. NEXT_PUBLIC_SITE_URL  — set this to the custom domain once it exists
 *   2. VERCEL_PROJECT_PRODUCTION_URL — stable production domain on Vercel
 *   3. VERCEL_URL            — per-deployment preview URL
 *   4. localhost             — local dev
 */
function resolve(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE_URL = resolve();
