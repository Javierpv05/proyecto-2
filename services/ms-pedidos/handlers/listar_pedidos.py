import json
import os

import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLE_NAME"])

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


def handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        tenant_id = query_params.get("tenant_id", "taco-bell")

        respuesta = tabla.query(
            KeyConditionExpression=Key("tenant_id").eq(tenant_id)
        )

        pedidos = respuesta.get("Items", [])

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(
                {
                    "tenant_id": tenant_id,
                    "total": len(pedidos),
                    "pedidos": pedidos,
                },
                default=str,
            ),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Error al listar pedidos: {str(e)}"}),
        }
