import json
import os
import uuid
from datetime import datetime, timezone
import boto3

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLA_PASOS"])


def handler(event, context):
    body = json.loads(event.get("body") or "{}")

    tenant_id = body.get("tenant_id", "taco-bell")
    pedido_id = body.get("pedido_id")
    paso = body.get("paso")
    responsable = body.get("responsable")

    paso_item = {
        "tenant_id": tenant_id,
        "paso_id": str(uuid.uuid4()),
        "pedido_id": pedido_id,
        "paso": paso,
        "responsable": responsable,
        "estado": "COMPLETADO",
        "fecha_fin": datetime.now(timezone.utc).isoformat(),
    }

    tabla.put_item(Item=paso_item)

    # TODO: Integrar con Step Functions send_task_success.
    # Se debe recibir un task_token (enviado por Step Functions al invocar esta Lambda),
    # guardarlo en DynamoDB junto al paso, y llamar:
    #   sfn = boto3.client("stepfunctions")
    #   sfn.send_task_success(taskToken=task_token, output=json.dumps(paso_item))
    # Esto reanuda la ejecución del flujo de estados del pedido en Step Functions.

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"mensaje": "Paso registrado", "paso": paso_item}),
    }
