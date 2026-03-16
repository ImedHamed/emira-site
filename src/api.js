// API base URL configuration
// In development: Vite proxy handles /api -> localhost:5000
// In production: points to the Render backend URL
export const API_URL = import.meta.env.VITE_API_URL || ''
