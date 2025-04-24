const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}