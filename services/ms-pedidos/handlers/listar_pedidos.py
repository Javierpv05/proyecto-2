import json
import os

import boto3
from boto3.dynamodb.conditions import Key
from utils import build_response, log_event

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLE_NAME"])



def handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        tenant_id = query_params.get("tenant_id", "popeyes")

        respuesta = tabla.query(
            KeyConditionExpression=Key("tenant_id").eq(tenant_id)
        )

        pedidos = respuesta.get("Items", [])
        # Orden de llegada (FIFO): el mas antiguo primero, asi cocina atiende
        # en el mismo orden en que entraron los pedidos.
        pedidos.sort(key=lambda p: p.get("fecha_creacion", ""))

        return build_response(200, {
            "tenant_id": tenant_id,
            "total": len(pedidos),
            "pedidos": pedidos,
        })

    except Exception as e:
        log_event("ERROR", f"Error al listar pedidos: {str(e)}")
        return build_response(500, {"error": f"Error al listar pedidos: {str(e)}"})
