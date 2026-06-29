# Instrucciones de Frontend para Agente IA — Madam Tusan


## 0. Contexto del Producto

Madam Tusan es una plataforma de pedidos para un restaurante de fusión chifa-peruana. Tiene dos tipos de usuario:

- **Cliente** → entra al menú, arma su pedido, lo sigue en tiempo real.
- **Trabajador** → gestiona el catálogo de platos, ve los pedidos que llegan y avanza el estado de cada uno desde cocina hasta entrega.

Todo el flujo es mobile-first. La app debe sentirse rápida, cálida y directa al punto.

---

## 1. Sistema de Diseño (Design Tokens)

### 1.1 Paleta de Colores

```
--color-primary:     #C0392B   /* Rojo intenso — acción principal, CTAs */
--color-primary-dark:#922B21   /* Rojo oscuro — hover de botones */
--color-gold:        #D4AC0D   /* Dorado — precio, badges de estado positivo */
--color-bg:          #FAFAF8   /* Blanco cálido — fondo general */
--color-surface:     #FFFFFF   /* Blanco puro — tarjetas, modales */
--color-text:        #1A1A1A   /* Negro suave — texto principal */
--color-muted:       #6B7280   /* Gris — texto secundario, placeholders */
--color-border:      #E5E7EB   /* Gris claro — bordes de cards y inputs */
--color-success:     #16A34A   /* Verde — estado ENTREGADO, disponible */
--color-warning:     #D97706   /* Ámbar — estado EN_REPARTO */
--color-info:        #2563EB   /* Azul — estado EN_DESPACHO */
--color-danger:      #DC2626   /* Rojo — errores, eliminar, no disponible */
```

### 1.2 Tipografía

```
--font-display: 'Playfair Display', serif        /* Titulares de sección, nombre del restaurante */
--font-body:    'Inter', sans-serif              /* Todo el resto: labels, párrafos, botones */

Escala tipográfica:
--text-xs:   12px
--text-sm:   14px
--text-base: 16px
--text-lg:   18px
--text-xl:   22px
--text-2xl:  28px
--text-3xl:  36px
```

### 1.3 Espaciado y Bordes

```
--radius-sm:  6px
--radius-md:  12px
--radius-lg:  20px
--radius-full: 9999px   /* Pills, badges */

--shadow-card: 0 1px 4px rgba(0,0,0,0.08)
--shadow-modal: 0 8px 32px rgba(0,0,0,0.18)
```

### 1.4 Estados de Color por Estado de Pedido

| Estado API     | Color de badge     | Texto del badge  |
|----------------|--------------------|------------------|
| `RECIBIDO`     | gris `#6B7280`     | Recibido         |
| `EN_COCINA`    | ámbar `#D97706`    | En preparación   |
| `EN_DESPACHO`  | azul `#2563EB`     | En camino        |
| `EN_REPARTO`   | naranja `#EA580C`  | En reparto       |
| `ENTREGADO`    | verde `#16A34A`    | Entregado ✓      |

---

## 2. Layout Global

### 2.1 Estructura base

```
┌─────────────────────────────────────────────┐
│              NAVBAR (fija, 60px)            │
├─────────────────────────────────────────────┤
│                                             │
│              CONTENIDO DE VISTA             │
│          (max-width: 1100px, centrado)      │
│                                             │
├─────────────────────────────────────────────┤
│        BOTTOMBAR MOBILE (solo móvil)        │
└─────────────────────────────────────────────┘
```

### 2.2 Navbar

- Fondo `--color-surface`, borde inferior `1px solid --color-border`, sombra sutil.
- **Izquierda:** Logo — el texto "Madam Tusan" en `--font-display`, color `--color-primary`, tamaño `--text-xl`.
- **Derecha (desktop):** Links: `Menú` / `Mi Pedido` / `Perfil` — en `--font-body --text-sm`, color `--color-text`. Si el usuario es trabajador, agregar link `Admin`.
- **Derecha (mobile):** Ícono de carrito con badge numérico en `--color-primary` + ícono de perfil (avatar circular).
- El link activo: subrayado con `--color-primary` 2px.

### 2.3 BottomBar (solo mobile, solo vistas de cliente)

Barra fija en la parte inferior con 4 íconos:
```
[🍽 Menú]   [🛒 Pedido]   [📦 Rastrear]   [👤 Perfil]
```
El ícono activo en `--color-primary`. Los inactivos en `--color-muted`.

---

## 3. Componentes Reutilizables

Construye estos componentes antes de hacer las páginas. Se usarán en múltiples vistas.

### 3.1 `<Button>`

```
Variantes:
- primary   → fondo --color-primary, texto blanco, border-radius --radius-md
- secondary → fondo transparent, borde 1.5px --color-primary, texto --color-primary
- danger    → fondo --color-danger, texto blanco
- ghost     → sin borde, texto --color-muted

Tamaños: sm (32px alto) / md (40px alto) / lg (48px alto)
Estado disabled: opacidad 40%, cursor not-allowed
Estado loading: spinner blanco centrado, texto oculto
Padding: 12px 20px (md)
```

### 3.2 `<Input>`

```
- Borde 1px --color-border, border-radius --radius-sm
- Fondo --color-surface, texto --color-text, placeholder --color-muted
- Focus: borde 2px --color-primary, sin outline nativo
- Error: borde --color-danger + mensaje de error en rojo debajo, text-xs
- Height: 44px (táctil)
```

### 3.3 `<Badge>` de estado

```
- Pill (border-radius: --radius-full)
- Padding: 4px 10px
- Font-size: --text-xs, font-weight: 600
- Colores según tabla de estados (sección 1.4)
```

### 3.4 `<ProductCard>`

```
┌──────────────────────────┐
│   [imagen 100% ancho     │
│    aspect-ratio: 4/3]    │
├──────────────────────────┤
│  Nombre del plato        │  ← --font-body, --text-base, bold
│  Descripción breve       │  ← --text-sm, --color-muted, 2 líneas max
│  S/. XX.XX               │  ← --font-body, --text-lg, --color-gold, bold
│                          │
│  [+ Agregar]             │  ← Button primary sm, ancho completo
└──────────────────────────┘
```
- `border-radius: --radius-md`
- `box-shadow: --shadow-card`
- Si `disponible: false`: tarjeta con opacidad 50%, botón deshabilitado con texto "No disponible".

### 3.5 `<StatusStepper>`

Muestra el progreso del pedido. 4 pasos en fila:

```
  ●────────●────────●────────●
RECIBIDO  EN_COCINA  EN_DESPACHO  ENTREGADO
```

- Paso completado: círculo `--color-primary`, línea `--color-primary`.
- Paso activo: círculo `--color-primary` con pulso/glow animado.
- Paso pendiente: círculo `--color-border`, línea `--color-border`.
- En mobile: apilar verticalmente con línea a la izquierda.

### 3.6 `<Modal>`

```
- Overlay oscuro rgba(0,0,0,0.5)
- Panel centrado, max-width 480px, --radius-lg, --shadow-modal
- Header con título + botón X para cerrar
- Footer con botones de acción (cancelar / confirmar)
- Animación: fade + scale desde 0.95 a 1
```

### 3.7 `<Toast>` de notificación

```
- Esquina inferior derecha (desktop) / inferior centrado (mobile)
- Tipos: success (verde) / error (rojo) / info (azul)
- Auto-cierre a los 4 segundos
- Ícono + mensaje de una línea
```

### 3.8 `<EmptyState>`

```
- Ícono grande centrado (SVG o emoji grande, ~64px)
- Título en --font-display --text-xl
- Subtítulo en --text-sm --color-muted
- Botón de acción opcional
```

---

## 4. Páginas del Cliente

---

### Página: `/login`

**Layout:** centrado vertical y horizontal, sin navbar. Fondo `--color-bg`.

**Construye:**

```
┌──────────────────────────────┐
│                              │
│     Madam Tusan              │  ← logo/nombre, --font-display, --color-primary, --text-3xl, centrado
│  El sabor de siempre         │  ← subtítulo, --text-sm, --color-muted
│                              │
│  ┌────────────────────────┐  │
│  │ Email                  │  │  ← <Input> type=email
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ Contraseña             │  │  ← <Input> type=password + ícono de ojo para mostrar/ocultar
│  └────────────────────────┘  │
│                              │
│  [    Ingresar    ]          │  ← <Button> primary lg, ancho completo
│                              │
│  ¿No tienes cuenta?          │
│  [Regístrate aquí]           │  ← link a /registro, --color-primary
│                              │
└──────────────────────────────┘
```

- El panel tiene `max-width: 400px`, `--radius-lg`, `--shadow-modal`, `padding: 40px`, fondo `--color-surface`.
- Error de credenciales: `<Toast>` tipo error con texto *"Email o contraseña incorrectos"*.
- Estado cargando: botón muestra spinner.

---

### Página: `/registro`

**Layout:** igual que login, panel centrado.

**Construye:**

```
┌──────────────────────────────┐
│  Crear cuenta                │  ← --font-display --text-2xl
│  Únete y pide en segundos    │  ← --text-sm --color-muted
│                              │
│  [Input: Nombre completo]    │
│  [Input: Email]              │
│  [Input: Contraseña]         │
│  [Input: Teléfono] (Opcional)│
│                              │
│  [   Crear mi cuenta   ]     │  ← Button primary lg, full width
│                              │
│  ¿Ya tienes cuenta?          │
│  [Inicia sesión]             │  ← link a /login
└──────────────────────────────┘
```

- No mostrar el campo `rol` al cliente. Se envía `"rol": "cliente"` fijo en el body.
- Validación inline: email con formato válido, contraseña mínimo 8 caracteres con mayúscula y número.
- Éxito: `<Toast>` verde + redirect a `/login`.

---

### Página: `/menu`

**Layout:** navbar + grid de tarjetas.

**Construye:**

**Encabezado de sección:**
```
Nuestro Menú                   ← --font-display --text-3xl --color-text
Los mejores platos, listos     ← --text-sm --color-muted
para ti.
```

**Grid de `<ProductCard>`:**
```
Desktop: 3 columnas
Tablet:  2 columnas
Mobile:  1 columna (tarjeta horizontal: imagen izq + info der)
Gap: 20px
```

- Al cargar: mostrar 6 tarjetas con skeleton loader (rectángulos grises animados con shimmer).
- Si el catálogo está vacío: `<EmptyState>` con ícono 🍽 y texto *"El menú estará disponible pronto"*.

**Carrito flotante (desktop):**
```
Barra lateral fija a la derecha (280px) mostrando:
- Título "Tu pedido"
- Lista de ítems seleccionados con cantidad editable (+/-)
- Total en grande: S/. XX.XX (--color-gold, --text-2xl, bold)
- [Confirmar pedido] → abre modal de nombre
```

**Modal de confirmación del pedido:**
```
Título: "¿A nombre de quién es el pedido?"
[Input: Tu nombre]
[Confirmar pedido]  [Cancelar]
```

Al confirmar: spinner en botón → llama a `POST /pedidos` → redirect a `/pedido/:pedido_id`.

---

### Página: `/pedido/:pedido_id`

**Layout:** navbar + contenido centrado, max-width 600px.

**Construye:**

```
┌─────────────────────────────────────┐
│  Tu pedido                          │  ← --font-display --text-2xl
│  Pedido #abc-123                    │  ← --text-sm --color-muted
│                                     │
│  ●────────●────────○────────○       │
│ RECIBIDO  EN_COCINA  EN_DESPACHO  ENTREGADO   ← <StatusStepper>
│                                     │
│  Estado actual:                     │
│  [badge: En preparación]            │  ← <Badge> según estado
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Resumen del pedido          │    │
│  │ ─────────────────────────  │    │
│  │ 2x Aeropuerto de Pollo      │    │
│  │                    S/. 51   │    │
│  │ ─────────────────────────  │    │
│  │ Total            S/. 51.00  │    │  ← --color-gold, bold
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

- Polling automático cada 15 segundos a `GET /pedidos/:pedido_id` para actualizar el estado sin que el usuario recargue.
- Cuando el estado cambia: animar el `<StatusStepper>` con transición suave.
- Si `ENTREGADO`: mostrar confetti animado + mensaje *"¡Tu pedido llegó! Buen provecho 🎉"*.

---

### Página: `/perfil`

**Layout:** navbar + panel centrado, max-width 480px.

**Construye:**

```
┌──────────────────────────────┐
│  [Avatar circular 80px]      │  ← iniciales del nombre sobre fondo --color-primary
│  Nombre del usuario          │  ← --font-display --text-2xl
│  email@ejemplo.com           │  ← --text-sm --color-muted
│                              │
│  ─────── Mi información ──── │
│  Nombre:   Juan Pérez        │
│  Teléfono: 987 654 321       │
│  Rol:      Cliente           │
│                              │
│  [✏ Editar perfil]          │  ← Button secondary, lleva a /perfil/editar
│  [Cerrar sesión]             │  ← Button ghost, rojo, limpia tokens y va a /login
└──────────────────────────────┘
```

---

### Página: `/perfil/editar`

**Layout:** navbar + panel centrado.

**Construye:**

```
Encabezado: "Editar perfil" ← --font-display --text-2xl

[Input: Nombre]    ← precargado con valor actual
[Input: Teléfono]  ← precargado con valor actual

[Guardar cambios]  ← Button primary, llama PUT /auth/usuario
[Cancelar]         ← link de regreso a /perfil
```

- Éxito: `<Toast>` verde *"Perfil actualizado"* + redirect a `/perfil`.
- Solo enviar los campos que hayan cambiado.

---

## 5. Páginas de Administración (rol: trabajador)

Todas las páginas admin viven bajo `/admin`. Si un usuario `cliente` intenta acceder a cualquier ruta de admin, redirigir a `/menu`.

**Layout admin:** navbar con link adicional `Admin` en el menú. Agregar un breadcrumb de navegación bajo el navbar:

```
Admin > [Sección actual]
```

---

### Página: `/admin/productos`

**Layout:** navbar + breadcrumb + tabla.

**Construye:**

**Encabezado:**
```
Catálogo de platos             ← --font-display --text-2xl
[+ Nuevo plato]                ← Button primary, derecha, lleva a /admin/productos/nuevo
```

**Tabla:**
```
| Nombre           | Precio   | Estado      | Acciones        |
|──────────────────|──────────|─────────────|─────────────────|
| Aeropuerto...    | S/. 25.50| ✅ Activo   | [Editar] [🗑]  |
| Lomo Saltado     | S/. 18.00| ❌ Inactivo | [Editar] [🗑]  |
```

- `Estado`: badge verde si `disponible: true`, rojo si `false`.
- `[Editar]`: link a `/admin/productos/:id`.
- `[🗑]`: abre `<Modal>` de confirmación antes de llamar `DELETE /productos/:id`.
- Skeleton loader de 5 filas mientras carga.
- EmptyState si no hay productos: ícono 🍜, texto *"Agrega tu primer plato al menú"*.

---

### Página: `/admin/productos/nuevo` y `/admin/productos/:id`

Estas dos páginas usan el **mismo formulario**. La de edición precarga los datos con `GET /productos/:id`.

**Construye:**

```
Encabezado:
  - "Nuevo plato"    (si es creación)
  - "Editar plato"   (si es edición) ← --font-display --text-2xl

[Input: Nombre del plato*]
[Input: Precio (S/.) *]          ← type=number, min=0, step=0.01
[Textarea: Descripción]          ← 3 filas, opcional
[Toggle: Disponible]             ← switch visual, activo por defecto

[Guardar plato]     ← Button primary
[Cancelar]          ← link a /admin/productos
```

- Los campos marcados con `*` muestran error si están vacíos al intentar guardar.
- El `Toggle` debe verse claramente: track gris/verde + thumb blanco con transición.
- Éxito: `<Toast>` verde + redirect a `/admin/productos`.

---

### Página: `/admin/pedidos`

**Layout:** navbar + breadcrumb + tabs de estado + tabla.

**Construye:**

**Encabezado:**
```
Pedidos                        ← --font-display --text-2xl
```

**Tabs de filtro por estado:**
```
[Todos] [Recibidos] [En cocina] [En despacho] [En reparto] [Entregados]
```
- Tab activo: subrayado `--color-primary` + texto `--color-primary`.
- Cada tab llama al endpoint correspondiente (`GET /pedidos` o `GET /pedidos/estado/{estado}`).

**Tabla:**
```
| ID (corto)  | Cliente        | Total     | Estado          | Acciones    |
|─────────────|────────────────|───────────|─────────────────|─────────────|
| abc-123     | Carlos Mendoza | S/. 51.00 | [En preparación]| [Avanzar]   |
```

- `ID`: mostrar solo los primeros 8 caracteres del `pedido_id`.
- `[Avanzar]`: Button primary sm. Abre el modal de workflow (ver sección 5.4).
- Ordenar por más reciente primero.
- Actualizar la tabla automáticamente cada 20 segundos.

---

### Modal de Workflow (desde `/admin/pedidos`)

Al hacer clic en `[Avanzar]` de cualquier pedido, abrir un `<Modal>`:

**Construye:**

```
┌──────────────────────────────────┐
│  Avanzar pedido #abc-123         │  ← título del modal
│  Cliente: Carlos Mendoza         │  ← --text-sm --color-muted
│  Estado actual: [badge actual]   │
│                                  │
│  Próximo paso:                   │
│  [●] COCINA       (si RECIBIDO)  │  ← radio seleccionado automáticamente
│  [●] DESPACHO     (si EN_COCINA) │    según el estado del pedido
│  [●] REPARTO      (si EN_DESPACHO)│
│                                  │
│  Observación (opcional):         │
│  [Textarea: Notas del paso]      │
│                                  │
│  [✅ Marcar como completado]     │  ← Button primary, llama POST /pasos/avanzar
│  [Cancelar]                      │
└──────────────────────────────────┘
```

- El campo `paso` se preselecciona automáticamente (RECIBIDO → COCINA, EN_COCINA → DESPACHO, EN_DESPACHO → REPARTO).
- El campo `usuario` se extrae del token JWT del trabajador logueado (no se muestra al usuario).
- Éxito: cerrar modal + `<Toast>` verde + actualizar el badge de estado en la fila de la tabla.

---

## 6. Comportamientos Globales

### 6.1 Autenticación y Guardias de Ruta

```
Rutas públicas (sin token):
  /login, /registro, /menu, /pedido/:id

Rutas protegidas (requieren token válido):
  /perfil, /perfil/editar

Rutas solo para trabajador:
  /admin/*

Si no hay token → redirigir a /login
Si el token expiró → intentar refresh silencioso; si falla → redirigir a /login
Si es cliente y entra a /admin/* → redirigir a /menu
```

### 6.2 Estados de Carga

- **Carga inicial de lista:** skeleton loaders (rectángulos grises con animación shimmer).
- **Envío de formulario:** botón de submit cambia a spinner + se deshabilita.
- **Acción en tabla:** la fila afectada muestra un spinner inline.

### 6.3 Manejo de Errores de API

| Código HTTP | Qué mostrar                                           |
|-------------|-------------------------------------------------------|
| 400         | Error inline en el campo correspondiente              |
| 401         | `<Toast>` error *"Sesión expirada. Inicia sesión."* → redirect `/login` |
| 403         | `<Toast>` error *"No tienes permiso para esta acción"* |
| 404         | `<EmptyState>` con mensaje específico                 |
| 500         | `<Toast>` error *"Algo salió mal. Intenta de nuevo."* |

### 6.4 Responsividad

```
Mobile first. Breakpoints:
  sm:  640px
  md:  768px
  lg:  1024px

Grid del menú:
  < 640px  → 1 columna (card horizontal)
  640-1024 → 2 columnas
  > 1024px → 3 columnas

Tabla de admin en mobile:
  Convertir a tarjetas apiladas, no tabla horizontal.
```

---

## 7. Orden de Construcción Recomendado

Construir en este orden para desbloquear el flujo completo lo antes posible:

```
1. Design tokens + componentes base (Button, Input, Badge, Toast)
2. /login + /registro  (ms-auth)
3. /menu               (ms-catalogo público)
4. /pedido/nuevo       (POST /pedidos)
5. /pedido/:id         (rastreador con StatusStepper)
6. /perfil + /perfil/editar
7. /admin/productos    (CRUD completo)
8. /admin/pedidos      (listado + tabs de estado)
9. Modal de workflow   (POST /pasos/avanzar)
10. ProductCard skeleton, EmptyStates, manejo de errores
```

---

*Este documento es la fuente de verdad visual del proyecto. Ante cualquier duda de diseño, consultar aquí antes de tomar una decisión.*