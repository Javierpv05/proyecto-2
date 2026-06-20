import json
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLA_PRODUCTOS"])


def handler(event, context):
    query_params = event.get("queryStringParameters") or {}
    tenant_id = query_params.get("tenant_id", "taco-bell")

    respuesta = tabla.query(
        KeyConditionExpression=Key("tenant_id").eq(tenant_id)
    )

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"items": respuesta["Items"], "count": respuesta["Count"]}),
    }
