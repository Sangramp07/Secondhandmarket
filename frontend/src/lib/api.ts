// Central API base URL — reads from env var on Vercel, falls back to Render backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://secondhand-product-marketplace.onrender.com';

export default API_URL;
