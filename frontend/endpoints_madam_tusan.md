# Listado de Endpoints y Request Bodies - Madam Tusan

A continuación se detalla la lista completa de endpoints expuestos por los microservicios del proyecto, incluyendo los métodos HTTP, las rutas y los **cuerpos de las peticiones (bodies) esperados**.

---

## 1. Microservicio de Autenticación (`ms-auth`)

Gestión de usuarios y autenticación a través de AWS Cognito.

### `POST /auth/registro` (Público)
Registra un nuevo usuario en la plataforma.
```json
{
    "email": "usuario@ejemplo.com",
    "password": "Pass1234",
    "nombre": "Juan Pérez",
    "telefono": "987654321",         // Opcional
    "rol": "cliente",                // "cliente" o "trabajador" (Opcional, por defecto "cliente")
    "tenant_id": "madam-tusan"       // Opcional, por defecto "madam-tusan"
}
```

### `POST /auth/login` (Público)
Inicia sesión y retorna los tokens (Access, ID, Refresh).
```json
{
    "email": "usuario@ejemplo.com",
    "password": "Pass1234"
}
```

### `GET /auth/usuario` (Protegido - Requiere JWT)
Obtiene el perfil del usuario autenticado.
- **Body**: *Ninguno.*

### `PUT /auth/usuario` (Protegido - Requiere JWT)
Actualiza la información del perfil del usuario autenticado.
```json
{
    "nombre": "Juan Pérez Modificado", // Opcional
    "telefono": "999888777"            // Opcional
}
```

---

## 2. Microservicio de Catálogo (`ms-catalogo`)

Gestión de productos y menús del restaurante.

### `GET /productos` (Público)
Lista todos los productos del catálogo.
- **Body**: *Ninguno.*

### `POST /productos` (Protegido - Requiere JWT)
Crea un nuevo producto en el catálogo.
```json
{
    "tenant_id": "madam-tusan",      // Opcional, por defecto "madam-tusan"
    "nombre": "Aeropuerto de Pollo", // Requerido
    "precio": 25.50,                 // Requerido
    "descripcion": "Chaufa con tallarín y pollo enrollado", // Opcional
    "disponible": true               // Opcional, por defecto true
}
```

### `GET /productos/{producto_id}` (Protegido - Requiere JWT)
Obtiene el detalle de un producto específico.
- **Body**: *Ninguno.*

### `PUT /productos/{producto_id}` (Protegido - Requiere JWT)
Modifica los atributos de un producto existente. Sólo se envían los campos que se desean actualizar.
```json
{
    "nombre": "Aeropuerto Especial", // Opcional
    "precio": 28.50,                 // Opcional
    "descripcion": "Nueva descripción", // Opcional
    "disponible": false              // Opcional
}
```

### `DELETE /productos/{producto_id}` (Protegido - Requiere JWT)
Elimina un producto del catálogo.
- **Body**: *Ninguno.*

---

## 3. Microservicio de Pedidos (`ms-pedidos`)

Recepción, consulta y listado de los pedidos.

### `POST /pedidos` (Público)
Crea un nuevo pedido. Lanza un evento hacia Step Functions a través de EventBridge.
```json
{
    "tenant_id": "madam-tusan",
    "cliente_nombre": "Carlos Mendoza",
    "items": [
        {
            "producto_id": "123456abcdef",
            "nombre": "Aeropuerto de Pollo",
            "cantidad": 2,
            "precio": 25.50
        }
    ],
    "total": 51.00
}
```

### `GET /pedidos/{pedido_id}` (Público)
Consulta el estado de un pedido específico.
- **Body**: *Ninguno.*

### `GET /pedidos` (Protegido - Requiere JWT)
Lista todos los pedidos registrados en el sistema.
- **Body**: *Ninguno.*

### `GET /pedidos/estado/{estado}` (Protegido - Requiere JWT)
Filtra los pedidos según su estado (ej. `RECIBIDO`, `EN_DESPACHO`, etc.).
- **Body**: *Ninguno.*

---

## 4. Microservicio de Workflow (`ms-workflow`)

Avanza el flujo de trabajo orquestado por AWS Step Functions.

### `POST /pasos/avanzar` (Protegido - Requiere JWT)
Invocado por el frontend/operador para marcar un paso como completado y reanudar la Step Function correspondiente.
```json
{
    "tenant_id": "madam-tusan",       // Opcional, por defecto "madam-tusan"
    "pedido_id": "abc-123-def-456",   // Requerido
    "paso": "COCINA",                 // Requerido. Opciones: "COCINA", "DESPACHO", "REPARTO"
    "usuario": "chef-luis",           // Opcional, usuario que completó la tarea
    "observacion": "Todo en orden"    // Opcional
}
```

---

## 5. OCI API Gateway (`api-rappi`)

Simulación de integración Multi-Cloud con un socio externo.

### `POST /pedidos`
Redirige directamente al endpoint `POST /pedidos` de AWS, inyectando un token Bearer en los headers.
- **Body**: Exactamente el mismo body que el `POST /pedidos` de AWS.

### `POST /estado`
Endpoint que apunta hacia la función Serverless de Oracle (Oracle Functions). Es consumido internamente por el microservicio de workflow de AWS para notificar actualizaciones.
```json
{
    "pedido_id": "abc-123-def-456",
    "estado": "EN_COCINA" // Valores esperados: "EN_COCINA", "EN_DESPACHO", "EN_REPARTO", "ENTREGADO"
}
```
