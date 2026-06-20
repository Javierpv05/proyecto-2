import json
import os
import uuid
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLA_PASOS"])

sfn_client = boto3.client("stepfunctions")

PASOS_VALIDOS = {"cocina", "despacho", "reparto"}

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


def handler(event, context):
    """
    Avanza el flujo de la Step Function enviando el taskToken.

    Body esperado:
    {
        "tenant_id": "taco-bell",
        "pedido_id": "abc123",
        "paso": "cocina" | "despacho" | "reparto",
        "usuario": "chef-juan",
        "task_token": "<token entregado por Step Functions>"
    }

    Si se invoca desde Step Functions (waitForTaskToken), el task_token
    puede venir en el payload directamente. En el flujo real, el frontend
    o el operador debe enviar el task_token que recibió al iniciar el paso.
    """
    try:
        # Soporte para invocación directa desde Step Functions
        # (el payload llega en el event sin 'body')
        if "body" in event and event["body"]:
            body = json.loads(event["body"])
        elif "task_token" in event or "pedido" in event:
            # Invocación directa desde Step Functions (waitForTaskToken)
            body = event
            if "pedido" in event:
                body.update(event["pedido"])
        else:
            body = event

        tenant_id = body.get("tenant_id", "taco-bell")
        pedido_id = body.get("pedido_id")
        paso = body.get("paso", "").lower()
        usuario = body.get("usuario", "sistema")
        task_token = body.get("task_token") or body.get("taskToken")

        # Validaciones
        if not pedido_id:
            return _error(400, "El campo 'pedido_id' es obligatorio")

        if paso not in PASOS_VALIDOS:
            return _error(
                400,
                f"Paso inválido '{paso}'. Los pasos válidos son: {', '.join(PASOS_VALIDOS)}",
            )

        if not task_token:
            return _error(400, "El campo 'task_token' es obligatorio para avanzar el workflow")

        # 1. Guardar el paso completado en DynamoDB
        paso_item = {
            "tenant_id": tenant_id,
            "paso_id": str(uuid.uuid4()),
            "pedido_id": pedido_id,
            "paso": paso,
            "usuario": usuario,
            "estado": "COMPLETADO",
            "fecha_fin": datetime.now(timezone.utc).isoformat(),
        }

        tabla.put_item(Item=paso_item)

        # 2. Notificar a Step Functions para reanudar el flujo
        output = json.dumps(
            {
                "paso": paso,
                "pedido_id": pedido_id,
                "tenant_id": tenant_id,
                "usuario": usuario,
                "completado_en": paso_item["fecha_fin"],
            }
        )

        sfn_client.send_task_success(
            taskToken=task_token,
            output=output,
        )

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(
                {
                    "mensaje": f"Paso '{paso}' completado. Workflow avanzado.",
                    "paso": paso_item,
                }
            ),
        }

    except sfn_client.exceptions.TaskDoesNotExist:
        return _error(404, "El task_token no corresponde a ninguna tarea activa en Step Functions")

    except sfn_client.exceptions.TaskTimedOut:
        return _error(410, "El task_token ha expirado. La tarea ya no está activa")

    except sfn_client.exceptions.InvalidToken:
        return _error(400, "El task_token proporcionado no es válido")

    except Exception as e:
        return _error(500, f"Error al avanzar el paso: {str(e)}")


def _error(status_code: int, mensaje: str) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": mensaje}),
    }
