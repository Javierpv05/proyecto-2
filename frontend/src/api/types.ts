// ─── Tipos compartidos ──────────────────────────────────────────────────────

/** Respuesta genérica de error de la API */
export interface ApiError {
  message: string;
  statusCode?: number;
  detail?: string;
}

// ─── ms-auth ────────────────────────────────────────────────────────────────

export type UserRole = 'cliente' | 'trabajador';

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  rol?: UserRole;
  tenant_id?: string;
}

export interface RegisterResponse {
  message: string;
  usuario_id?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  AccessToken: string;
  IdToken: string;
  RefreshToken: string;
  ExpiresIn?: number;
  TokenType?: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
}

export interface UserProfile {
  email: string;
  nombre: string;
  telefono?: string;
  rol: UserRole;
  tenant_id: string;
  sub?: string;
}

export interface UpdateUserRequest {
  nombre?: string;
  telefono?: string;
}

// ─── ms-catalogo ────────────────────────────────────────────────────────────

export interface Producto {
  producto_id: string;
  tenant_id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  disponible: boolean;
  creado_en?: string;
}

export interface CreateProductoRequest {
  nombre: string;
  precio: number;
  descripcion?: string;
  disponible?: boolean;
  tenant_id?: string;
}

export interface UpdateProductoRequest {
  nombre?: string;
  precio?: number;
  descripcion?: string;
  disponible?: boolean;
}

// ─── ms-pedidos ─────────────────────────────────────────────────────────────

export type EstadoPedido =
  | 'RECIBIDO'
  | 'EN_COCINA'
  | 'EN_DESPACHO'
  | 'EN_REPARTO'
  | 'ENTREGADO';

export interface ItemPedido {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface CreatePedidoRequest {
  tenant_id: string;
  cliente_nombre: string;
  cliente_telefono?: string;
  items: ItemPedido[];
  total: number;
}

export interface Pedido {
  pedido_id: string;
  tenant_id: string;
  cliente_nombre: string;
  items: ItemPedido[];
  total: number;
  estado: EstadoPedido;
  creado_en?: string;
  actualizado_en?: string;
}

export interface CreatePedidoResponse {
  message: string;
  pedido_id: string;
}

// ─── ms-workflow ─────────────────────────────────────────────────────────────

export type PasoWorkflow = 'COCINA' | 'DESPACHO' | 'REPARTO';

export interface AvanzarPasoRequest {
  pedido_id: string;
  paso: PasoWorkflow;
  tenant_id?: string;
  usuario?: string;
  observacion?: string;
}

export interface AvanzarPasoResponse {
  message: string;
  pedido_id: string;
  paso: PasoWorkflow;
}

// ─── OCI api-rappi ───────────────────────────────────────────────────────────

/** Mismo body que CreatePedidoRequest — reutilizamos el tipo */
export type RappiPedidoRequest = CreatePedidoRequest;

export interface NotificarEstadoRequest {
  pedido_id: string;
  estado: EstadoPedido;
}

export interface NotificarEstadoResponse {
  message: string;
}
