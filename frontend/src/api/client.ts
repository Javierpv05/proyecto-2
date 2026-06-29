export class ApiClientError extends Error {
  public statusCode?: number;
  public detail?: string;

  constructor(message: string, statusCode?: number, detail?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

// Cada microservicio del backend es un API Gateway distinto (no hay un
// dominio unico), por eso el cliente se construye una vez por servicio,
// cada uno con su propia URL base tomada de las variables de entorno.
function createApiClient(baseUrl: string) {
  async function fetchClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, headers, ...customConfig } = options;

    const config: RequestInit = {
      ...customConfig,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (requiresAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, config);

      // Si la respuesta no tiene contenido (ej. DELETE 204), retornamos null o undefined
      if (response.status === 204) {
        return null as unknown as T;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiClientError(
          data.message || 'Error en la petición',
          response.status,
          data.detail
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Error desconocido al conectar con la API'
      );
    }
  }

  return {
    get: <T>(endpoint: string, options?: RequestOptions) =>
      fetchClient<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
      fetchClient<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

    put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
      fetchClient<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
      fetchClient<T>(endpoint, { ...options, method: 'DELETE' }),
  };
}

export const authClient = createApiClient(import.meta.env.VITE_AUTH_API ?? '');
export const catalogoClient = createApiClient(import.meta.env.VITE_CATALOGO_API ?? '');
export const pedidosClient = createApiClient(import.meta.env.VITE_PEDIDOS_API ?? '');
export const workflowClient = createApiClient(import.meta.env.VITE_WORKFLOW_API ?? '');
