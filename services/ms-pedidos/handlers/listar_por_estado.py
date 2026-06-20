import json
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLA_PEDIDOS"])


def handler(event, context):
    path_params = event.get("pathParameters") or {}
    query_params = event.get("queryStringParameters") or {}

    tenant_id = query_params.get("tenant_id", "taco-bell")
    estado = path_params.get("estado", "").upper()
    tenant_estado = f"{tenant_id}#{estado}"

    respuesta = tabla.query(
        IndexName="PorEstado",
        KeyConditionExpression=Key("tenant_estado").eq(tenant_estado),
        ScanIndexForward=True,  # orden ascendente por fecha_creacion
    )

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(
            {
                "items": respuesta["Items"],
                "count": respuesta["Count"],
                "tenant_estado": tenant_estado,
            }
        ),
    }
