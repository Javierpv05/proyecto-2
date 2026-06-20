import json
import os
import uuid
import boto3

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLA_PRODUCTOS"])


def handler(event, context):
    body = json.loads(event.get("body") or "{}")
    tenant_id = body.get("tenant_id", "taco-bell")

    producto = {
        "tenant_id": tenant_id,
        "producto_id": str(uuid.uuid4()),
        "nombre": body.get("nombre"),
        "precio": body.get("precio"),
        "descripcion": body.get("descripcion", ""),
        "disponible": body.get("disponible", True),
    }

    tabla.put_item(Item=producto)

    return {
        "statusCode": 201,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"mensaje": "Producto creado", "producto": producto}),
    }
