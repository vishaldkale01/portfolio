const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-etg0.onrender.com/api';
console.log('API Base URL:', API_BASE_URL);
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}