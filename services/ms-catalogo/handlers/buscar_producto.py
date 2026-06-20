import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLA_PRODUCTOS"])


def handler(event, context):
    path_params = event.get("pathParameters") or {}
    query_params = event.get("queryStringParameters") or {}

    tenant_id = query_params.get("tenant_id", "taco-bell")
    producto_id = path_params.get("producto_id")

    respuesta = tabla.get_item(
        Key={"tenant_id": tenant_id, "producto_id": producto_id}
    )

    item = respuesta.get("Item")
    if not item:
        return {
            "statusCode": 404,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": "Producto no encontrado"}),
        }

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"producto": item}),
    }
