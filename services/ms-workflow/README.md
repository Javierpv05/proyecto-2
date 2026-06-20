# ms-workflow

TODO:
- Orquestación del flujo de vida del pedido (recibido → preparando → listo → entregado)
- Consumer de eventos EventBridge: `PedidoCreado`, `PedidoActualizado`
- Integración con AWS Step Functions para el flujo de estados
- Notificaciones a trabajadores vía WebSocket API Gateway o SNS
- Tabla DynamoDB: workflow-{stage} para estado actual de cada pedido
