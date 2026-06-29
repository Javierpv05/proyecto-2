import { apiClient } from './client';
import type {
  Pedido,
  CreatePedidoRequest,
  CreatePedidoResponse,
  EstadoPedido,
} from './types';

const BASE_PATH = '/pedidos';

export const pedidosService = {
  /**
   * Crea un nuevo pedido. Lanza un evento hacia Step Functions a través de EventBridge.
   * POST /pedidos (Público)
   */
  crearPedido: (data: CreatePedidoRequest): Promise<CreatePedidoResponse> => {
    return apiClient.post<CreatePedidoResponse>(BASE_PATH, data, { requiresAuth: false });
  },

  /**
   * Lista todos los pedidos registrados en el sistema.
   * GET /pedidos (Protegido)
   */
  getPedidos: (): Promise<Pedido[]> => {
    return apiClient.get<Pedido[]>(BASE_PATH, { requiresAuth: true });
  },

  /**
   * Consulta el estado de un pedido específico.
   * GET /pedidos/{pedido_id} (Público)
   */
  getPedidoById: (pedido_id: string): Promise<Pedido> => {
    return apiClient.get<Pedido>(`${BASE_PATH}/${pedido_id}`, { requiresAuth: false });
  },

  /**
   * Filtra los pedidos según su estado.
   * GET /pedidos/estado/{estado} (Protegido)
   */
  getPedidosByEstado: (estado: EstadoPedido): Promise<Pedido[]> => {
    return apiClient.get<Pedido[]>(`${BASE_PATH}/estado/${estado}`, { requiresAuth: true });
  },
};
