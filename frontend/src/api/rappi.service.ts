import { rappiSimClient as apiClient } from './client';
import type {
  RappiPedidoRequest,
  CreatePedidoResponse,
} from './types';

// Esto SOLO es para pruebas/demo. En el flujo real, Rappi llama directo a
// OCI (sin frontend de por medio) y OCI reenvia a AWS /pedidos/externos con
// la x-api-key inyectada de su lado (ver oci/api-rappi). Esta pagina solo
// imita esa llamada para poder probarla desde el navegador.

export const rappiService = {
  /**
   * POST /pedidos en el API Gateway de OCI (path-prefix /rappi ya incluido
   * en VITE_OCI_RAPPI_URL) -> reenvia a AWS /pedidos/externos.
   */
  crearPedido: (data: RappiPedidoRequest): Promise<CreatePedidoResponse> => {
    return apiClient.post<CreatePedidoResponse>('/pedidos', data, { requiresAuth: false });
  },
};
