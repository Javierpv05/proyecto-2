import { apiClient } from './client';
import type {
  RappiPedidoRequest,
  CreatePedidoResponse,
  NotificarEstadoRequest,
  NotificarEstadoResponse,
} from './types';

// En un entorno real, estos endpoints podrían apuntar a un dominio diferente (el API Gateway de OCI).
// Aquí los mantenemos relativos asumiendo que un proxy los manejaría, o puedes configurar 
// un BASE_URL diferente en el apiClient para estos casos.

export const rappiService = {
  /**
   * Simulación de integración Multi-Cloud: Redirige directamente al endpoint POST /pedidos de AWS.
   * POST /pedidos (En API Gateway OCI)
   */
  crearPedido: (data: RappiPedidoRequest): Promise<CreatePedidoResponse> => {
    // Si la ruta en OCI es /rappi/pedidos, se ajustaría aquí.
    return apiClient.post<CreatePedidoResponse>('/rappi/pedidos', data, { requiresAuth: false });
  },

  /**
   * Apunta hacia la función Serverless de Oracle para notificar actualizaciones de estado.
   * POST /estado
   */
  notificarEstado: (data: NotificarEstadoRequest): Promise<NotificarEstadoResponse> => {
    return apiClient.post<NotificarEstadoResponse>('/rappi/estado', data, { requiresAuth: false });
  },
};
