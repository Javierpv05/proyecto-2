import json
import os
import uuid
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLE_NAME"])

events_client = boto3.client("events")
EVENT_BUS_NAME = os.environ["EVENT_BUS_NAME"]

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        tenant_id = body.get("tenant_id")
        cliente_nombre = body.get("cliente_nombre")
        items = body.get("items", [])
        total = body.get("total")

        if not tenant_id or not cliente_nombre or not items or total is None:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps(
                    {
                        "error": (
                            "Los campos 'tenant_id', 'cliente_nombre', "
                            "'items' y 'total' son obligatorios"
                        )
                    }
                ),
            }

        pedido_id = uuid.uuid4().hex
        fecha_creacion = datetime.now(timezone.utc).isoformat()
        estado = "RECIBIDO"

        pedido = {
            "tenant_id": tenant_id,
            "pedido_id": pedido_id,
            "cliente_nombre": cliente_nombre,
            "items": items,
            "total": str(total),
            "estado": estado,
            "fecha_creacion": fecha_creacion,
            "tenant_estado": f"{tenant_id}#{estado}",
        }

        tabla.put_item(Item=pedido)

        # Publicar evento en EventBridge
        events_client.put_events(
            Entries=[
                {
                    "Source": "com.pedidos.sistema",
                    "DetailType": "PedidoCreado",
                    "Detail": json.dumps(pedido),
                    "EventBusName": EVENT_BUS_NAME,
                }
            ]
        )

        return {
            "statusCode": 201,
            "headers": CORS_HEADERS,
            "body": json.dumps(
                {
                    "mensaje": "Pedido creado exitosamente",
                    "pedido_id": pedido_id,
                    "estado": estado,
                    "fecha_creacion": fecha_creacion,
                }
            ),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Error al crear pedido: {str(e)}"}),
        }
