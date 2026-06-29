import { workflowClient as apiClient } from './client';
import type {
  AvanzarPasoRequest,
  AvanzarPasoResponse,
} from './types';

const BASE_PATH = '/pasos';

export const workflowService = {
  /**
   * Invocado por el frontend/operador para marcar un paso como completado y reanudar la Step Function correspondiente.
   * POST /pasos/avanzar (Protegido)
   */
  avanzarPaso: (data: AvanzarPasoRequest): Promise<AvanzarPasoResponse> => {
    return apiClient.post<AvanzarPasoResponse>(`${BASE_PATH}/avanzar`, data, { requiresAuth: true });
  },
};
