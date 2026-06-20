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
        path_params = event.get("pathParameters") or {}
        query_params = event.get("queryStringParameters") or {}

        pedido_id = path_params.get("pedido_id")
        tenant_id = query_params.get("tenant_id", "taco-bell")

        if not pedido_id:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "El parámetro 'pedido_id' es obligatorio"}),
            }

        respuesta = tabla.get_item(
            Key={"tenant_id": tenant_id, "pedido_id": pedido_id}
        )

        pedido = respuesta.get("Item")

        if not pedido:
            return {
                "statusCode": 404,
                "headers": CORS_HEADERS,
                "body": json.dumps(
                    {
                        "error": (
                            f"Pedido '{pedido_id}' no encontrado "
                            f"para el tenant '{tenant_id}'"
                        )
                    }
                ),
            }

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(pedido, default=str),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Error al consultar pedido: {str(e)}"}),
        }
