import { ApiResponse, ApiErrorResponse } from '../types';
import { getApiUrl } from './config';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private getHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorData;

      if (isJson) {
        try {
          errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText;
        }
      } else {
        errorMessage = await response.text();
      }

      // Special handling for authentication errors
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    if (!isJson) {
      const text = await response.text();
      return { data: text as unknown as T };
    }

    const data = await response.json();
    return { data };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      console.log(getApiUrl(endpoint));
      const response = await fetch(getApiUrl(endpoint), {
        headers: this.getHeaders()
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: error.message, status: error.statusCode || 500 };
      }
      return { error: error instanceof Error ? error.message : 'Unknown error', status: 500 };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: error.message, status: error.statusCode || 500 };
      }
      return { error: error instanceof Error ? error.message : 'Unknown error', status: 500 };
    }
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: error.message, status: error.statusCode || 500 };
      }
      return { error: error instanceof Error ? error.message : 'Unknown error', status: 500 };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return { error: 'Authentication expired', status: 401 };
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: error.message, status: error.statusCode || 500 };
      }
      return { error: error instanceof Error ? error.message : 'Unknown error', status: 500 };
    }
  }

  // Helper method to check if an error response indicates an authentication error
  isAuthError(response: ApiResponse<any>): boolean {
    return 'status' in response && response.status === 401;
  }
}

export const api = new ApiService();