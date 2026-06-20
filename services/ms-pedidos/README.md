# ms-pedidos

TODO:
- Recepción y creación de pedidos (POST /pedidos)
- Consulta de pedido por ID (GET /pedidos/{pedidoId})
- Listado de pedidos por tenant (GET /pedidos?tenant_id=xxx)
- Integración con EventBridge para emitir evento `PedidoCreado`
- Tabla DynamoDB: pedidos-{stage} (PK: tenant_id, SK: pedido_id)
- Validación de productos contra ms-catalogo
