// Central API base URL — reads from env var on Vercel, falls back to localhost for dev
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default API_URL;
