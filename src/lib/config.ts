// Server-side (SSR/Node.js on VPS): directly hits internal API
// Client-side (browser): empty string = relative URL, proxied via Next.js rewrites
export const API_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL_INTERNAL ?? 'http://127.0.0.1:5001')
    : '';

