// Isse confirm hota hai ki URL hamesha ek string rahega
export const FLASK_API = String(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');