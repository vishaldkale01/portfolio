const API_BASE_URL = 'https://portfolio-etg0.onrender.com/api';

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}