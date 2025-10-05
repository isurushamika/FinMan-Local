import { apiClient } from './client';
import { setAuthToken, removeAuthToken } from './config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  logout(): void {
    removeAuthToken();
  },
};
