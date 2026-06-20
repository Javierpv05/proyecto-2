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

        estado = path_params.get("estado")
        tenant_id = query_params.get("tenant_id", "taco-bell")

        if not estado:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "El parámetro 'estado' es obligatorio"}),
            }

        # Clave compuesta para el GSI PorEstado
        tenant_estado = f"{tenant_id}#{estado.upper()}"

        respuesta = tabla.query(
            IndexName="PorEstado",
            KeyConditionExpression=Key("tenant_estado").eq(tenant_estado),
        )

        pedidos = respuesta.get("Items", [])

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(
                {
                    "tenant_id": tenant_id,
                    "estado": estado.upper(),
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
            "body": json.dumps(
                {"error": f"Error al listar pedidos por estado: {str(e)}"}
            ),
        }
