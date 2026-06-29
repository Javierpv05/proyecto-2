import { pedidosClient as apiClient } from './client';
import type {
  RappiPedidoRequest,
  CreatePedidoResponse,
  NotificarEstadoRequest,
  NotificarEstadoResponse,
} from './types';

// Nota: en el flujo real, OCI es quien llama a AWS directamente (ver
// oci/api-rappi) — este servicio del frontend no se usa en producción,
// solo serviria si se quisiera simular un pedido de Rappi desde la UI
// de pruebas. Por eso usa pedidosClient (apunta a AWS /pedidos/externos
// seria lo correcto, pero ese endpoint exige x-api-key que no debe vivir
// en el frontend; dejar esto fuera del flujo real es la opcion correcta).

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
