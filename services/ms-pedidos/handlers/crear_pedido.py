import json
import os
import uuid
from datetime import datetime, timezone
import boto3

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLA_PEDIDOS"])
events = boto3.client("events")

BUS_PEDIDOS = os.environ["BUS_PEDIDOS"]


def handler(event, context):
    body = json.loads(event.get("body") or "{}")

    tenant_id = body.get("tenant_id", "taco-bell")
    estado_actual = "RECIBIDO"

    pedido = {
        "tenant_id": tenant_id,
        "pedido_id": str(uuid.uuid4()),
        "estado_actual": estado_actual,
        "tenant_estado": f"{tenant_id}#{estado_actual}",
        "fecha_creacion": datetime.now(timezone.utc).isoformat(),
        "cliente": body.get("cliente"),
        "items": body.get("items", []),
        "total": body.get("total"),
        "origen": body.get("origen", "web"),
    }

    tabla.put_item(Item=pedido)

    events.put_events(
        Entries=[
            {
                "Source": "pedidos.app",
                "DetailType": "PedidoCreado",
                "Detail": json.dumps(
                    {"tenant_id": tenant_id, "pedido_id": pedido["pedido_id"]}
                ),
                "EventBusName": BUS_PEDIDOS,
            }
        ]
    )

    return {
        "statusCode": 201,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"mensaje": "Pedido creado", "pedido": pedido}),
    }
