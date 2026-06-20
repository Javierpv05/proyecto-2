"""
iniciar_workflow.py — Inicia la ejecución de la Step Function WorkflowPedido.

Puede ser invocado:
  - Por EventBridge (event['detail'] contiene el pedido).
  - Por invocación Lambda directa (event contiene el pedido).
  - Por API Gateway (event['body'] contiene el pedido en JSON).
"""
import json
import os
import uuid

import boto3
from utils import build_response, log_event

sfn_client = boto3.client("stepfunctions")
STATE_MACHINE_ARN = os.environ["STATE_MACHINE_ARN"]



def handler(event, context):
    try:
        # ── Normalizar el origen del evento ───────────────────────────────
        if "detail" in event:
            # Viene de EventBridge
            pedido = event["detail"]
        elif "body" in event and event["body"]:
            # Viene de API Gateway
            pedido = json.loads(event["body"])
        else:
            # Invocación Lambda directa
            pedido = event

        tenant_id = pedido.get("tenant_id")
        pedido_id = pedido.get("pedido_id")

        if not tenant_id or not pedido_id:
            log_event("WARN", "Campos obligatorios faltantes", {"body": event.get("body")})
            return build_response(400, {"error": "Los campos 'tenant_id' y 'pedido_id' son obligatorios"})

        # Nombre único y trazable para la ejecución
        execution_name = f"{tenant_id}-{pedido_id}-{uuid.uuid4().hex[:8]}"

        respuesta = sfn_client.start_execution(
            stateMachineArn=STATE_MACHINE_ARN,
            name=execution_name,
            input=json.dumps(pedido),
        )

        execution_arn = respuesta["executionArn"]

        log_event("INFO", "Workflow iniciado", {"executionName": execution_name})
        return build_response(200, {
            "mensaje": "Workflow iniciado exitosamente",
            "tenant_id": tenant_id,
            "pedido_id": pedido_id,
            "executionArn": execution_arn,
            "executionName": execution_name,
        })

    except Exception as e:
        log_event("ERROR", f"Error al iniciar workflow: {str(e)}")
        return build_response(500, {"error": f"Error al iniciar workflow: {str(e)}"})
