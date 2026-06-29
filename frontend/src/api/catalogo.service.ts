import { catalogoClient as apiClient } from './client';
import type {
  Producto,
  CreateProductoRequest,
  UpdateProductoRequest,
} from './types';

const BASE_PATH = '/productos';

export const catalogoService = {
  /**
   * Lista todos los productos del catálogo.
   * GET /productos (Público)
   */
  getProductos: (): Promise<Producto[]> => {
    return apiClient.get<Producto[]>(BASE_PATH, { requiresAuth: false });
  },

  /**
   * Obtiene el detalle de un producto específico.
   * GET /productos/{producto_id} (Protegido)
   */
  getProductoById: (producto_id: string): Promise<Producto> => {
    return apiClient.get<Producto>(`${BASE_PATH}/${producto_id}`, { requiresAuth: true });
  },

  /**
   * Crea un nuevo producto en el catálogo.
   * POST /productos (Protegido)
   */
  crearProducto: (data: CreateProductoRequest): Promise<Producto> => {
    return apiClient.post<Producto>(BASE_PATH, data, { requiresAuth: true });
  },

  /**
   * Modifica los atributos de un producto existente.
   * PUT /productos/{producto_id} (Protegido)
   */
  actualizarProducto: (producto_id: string, data: UpdateProductoRequest): Promise<Producto> => {
    return apiClient.put<Producto>(`${BASE_PATH}/${producto_id}`, data, { requiresAuth: true });
  },

  /**
   * Elimina un producto del catálogo.
   * DELETE /productos/{producto_id} (Protegido)
   */
  eliminarProducto: (producto_id: string): Promise<void> => {
    return apiClient.delete<void>(`${BASE_PATH}/${producto_id}`, { requiresAuth: true });
  },

  /**
   * Pide una URL prefirmada de S3 para subir la imagen de un producto.
   * POST /productos/upload-url (Protegido)
   */
  obtenerUrlSubidaImagen: (content_type: string): Promise<{ upload_url: string; public_url: string }> => {
    return apiClient.post<{ upload_url: string; public_url: string }>(
      `${BASE_PATH}/upload-url`,
      { content_type },
      { requiresAuth: true }
    );
  },
};
