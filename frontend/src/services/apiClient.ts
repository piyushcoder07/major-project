import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiException } from '../types/api';

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private defaultRetryConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error: AxiosError) => {
      // Don't retry authentication failures (401) or client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
      // Retry on network errors or 5xx server errors
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    },
  };

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        return response;
      },
      (error: AxiosError<ApiResponse<any>>) => {
        return this.handleError(error);
      }
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    config: RetryConfig = this.defaultRetryConfig
  ): Promise<AxiosResponse<T>> {
    let lastError: AxiosError;

    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as AxiosError;

        // Don't retry if it's the last attempt or if retry condition is not met
        if (attempt === config.retries || !config.retryCondition?.(lastError)) {
          break;
        }

        // Wait before retrying with exponential backoff
        const delay = config.retryDelay * Math.pow(2, attempt);
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private handleError(error: AxiosError<ApiResponse<any>>): Promise<never> {
    let message = 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';
    let status = 500;

    if (error.response) {
      // Server responded with error status
      status = error.response.status;
      
      if (error.response.data?.error) {
        message = error.response.data.error.message;
        code = error.response.data.error.code;
      } else {
        switch (status) {
          case 401:
            message = error.response.data?.error?.message || 'Authentication required';
            code = error.response.data?.error?.code || 'UNAUTHORIZED';
            // Only clear token and redirect if this is NOT a login attempt
            if (!error.config?.url?.includes('/auth/login')) {
              localStorage.removeItem('token');
              if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                // Use replace to avoid adding to history and prevent back button issues
                window.location.replace('/login');
              }
            }
            break;
          case 403:
            message = 'Access forbidden';
            code = 'FORBIDDEN';
            break;
          case 404:
            message = 'Resource not found';
            code = 'NOT_FOUND';
            break;
          case 422:
            message = 'Validation error';
            code = 'VALIDATION_ERROR';
            break;
          case 429:
            message = 'Too many requests - please try again later';
            code = 'RATE_LIMITED';
            break;
          case 500:
            message = 'Internal server error';
            code = 'SERVER_ERROR';
            break;
          case 502:
            message = 'Service temporarily unavailable';
            code = 'BAD_GATEWAY';
            break;
          case 503:
            message = 'Service temporarily unavailable';
            code = 'SERVICE_UNAVAILABLE';
            break;
          case 504:
            message = 'Request timeout - please try again';
            code = 'GATEWAY_TIMEOUT';
            break;
        }
      }
    } else if (error.request) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        message = 'Request timeout - please try again';
        code = 'TIMEOUT';
      } else {
        message = 'Network error - please check your connection';
        code = 'NETWORK_ERROR';
      }
      status = 0;
    } else {
      // Request setup error
      message = 'Request configuration error';
      code = 'REQUEST_ERROR';
    }

    const apiError = new ApiException(message, code, status, error.response?.data);
    return Promise.reject(apiError);
  }

  async get<T>(url: string, params?: any, retryConfig?: Partial<RetryConfig>): Promise<T> {
    const config = { ...this.defaultRetryConfig, ...retryConfig };
    const response = await this.retryRequest(
      () => this.client.get<ApiResponse<T>>(url, { params }),
      config
    );
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new ApiException(
      response.data.error?.message || 'Request failed',
      response.data.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  async post<T>(url: string, data?: any, retryConfig?: Partial<RetryConfig>): Promise<T> {
    const config = { 
      ...this.defaultRetryConfig, 
      ...retryConfig,
      // Don't retry POST requests by default to avoid duplicate operations
      retries: retryConfig?.retries ?? 0
    };
    
    const response = await this.retryRequest(
      () => this.client.post<ApiResponse<T>>(url, data),
      config
    );
    
    if (response.data.success) {
      // For void operations (like logout), data can be null
      return response.data.data as T;
    }
    throw new ApiException(
      response.data.error?.message || 'Request failed',
      response.data.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  async put<T>(url: string, data?: any, retryConfig?: Partial<RetryConfig>): Promise<T> {
    const config = { 
      ...this.defaultRetryConfig, 
      ...retryConfig,
      // Don't retry PUT requests by default to avoid duplicate operations
      retries: retryConfig?.retries ?? 0
    };
    
    const response = await this.retryRequest(
      () => this.client.put<ApiResponse<T>>(url, data),
      config
    );
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new ApiException(
      response.data.error?.message || 'Request failed',
      response.data.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  async delete<T>(url: string, retryConfig?: Partial<RetryConfig>): Promise<T> {
    const config = { 
      ...this.defaultRetryConfig, 
      ...retryConfig,
      // Don't retry DELETE requests by default to avoid duplicate operations
      retries: retryConfig?.retries ?? 0
    };
    
    const response = await this.retryRequest(
      () => this.client.delete<ApiResponse<T>>(url),
      config
    );
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new ApiException(
      response.data.error?.message || 'Request failed',
      response.data.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  // Method to check if the API is reachable
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', undefined, { retries: 1, retryDelay: 500 });
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();