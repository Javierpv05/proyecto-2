import { apiClient } from './client';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  UserProfile,
  UpdateUserRequest,
} from './types';

const BASE_PATH = '/auth';

export const authService = {
  /**
   * Registra un nuevo usuario en la plataforma.
   * POST /auth/registro (Público)
   */
  registro: (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>(`${BASE_PATH}/registro`, data, { requiresAuth: false });
  },

  /**
   * Inicia sesión y retorna los tokens.
   * POST /auth/login (Público)
   */
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>(`${BASE_PATH}/login`, data, { requiresAuth: false });
  },

  /**
   * Obtiene el perfil del usuario autenticado.
   * GET /auth/usuario (Protegido)
   */
  getUsuario: (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(`${BASE_PATH}/usuario`, { requiresAuth: true });
  },

  /**
   * Actualiza la información del perfil del usuario autenticado.
   * PUT /auth/usuario (Protegido)
   */
  updateUsuario: (data: UpdateUserRequest): Promise<UserProfile> => {
    return apiClient.put<UserProfile>(`${BASE_PATH}/usuario`, data, { requiresAuth: true });
  },
};
