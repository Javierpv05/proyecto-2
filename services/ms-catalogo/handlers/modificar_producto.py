import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLA_PRODUCTOS"])

CAMPOS_PERMITIDOS = ["nombre", "precio", "descripcion", "disponible"]


def handler(event, context):
    path_params = event.get("pathParameters") or {}
    query_params = event.get("queryStringParameters") or {}
    body = json.loads(event.get("body") or "{}")

    tenant_id = query_params.get("tenant_id", "taco-bell")
    producto_id = path_params.get("producto_id")

    update_parts = []
    attr_names = {}
    attr_values = {}

    for campo in CAMPOS_PERMITIDOS:
        if campo in body:
            update_parts.append(f"#{campo} = :{campo}")
            attr_names[f"#{campo}"] = campo
            attr_values[f":{campo}"] = body[campo]

    if not update_parts:
        return {
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": "No se enviaron campos válidos para actualizar"}),
        }

    respuesta = tabla.update_item(
        Key={"tenant_id": tenant_id, "producto_id": producto_id},
        UpdateExpression="SET " + ", ".join(update_parts),
        ExpressionAttributeNames=attr_names,
        ExpressionAttributeValues=attr_values,
        ReturnValues="ALL_NEW",
    )

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"producto": respuesta["Attributes"]}),
    }
