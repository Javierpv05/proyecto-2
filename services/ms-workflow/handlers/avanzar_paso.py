"""
avanzar_paso.py — Endpoint público: POST /pasos/avanzar

El operador o frontend llama a este endpoint cuando completa un paso.
El handler:
  1. Valida el body.
  2. Busca en DynamoDB el paso PENDIENTE del pedido para obtener el task_token.
  3. Llama a send_task_success para reanudar la Step Function.
  4. Actualiza el estado del paso en DynamoDB a COMPLETADO.

Body esperado:
{
    "tenant_id": "taco-bell",
    "pedido_id": "abc123",
    "paso": "COCINA" | "DESPACHO" | "REPARTO",
    "usuario": "chef-juan",
    "observacion": "Listo en 10 min"   (opcional)
}
"""
import json
import os
import uuid
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Key, Attr
from utils import build_response, log_event

dynamodb = boto3.resource("dynamodb")
tabla = dynamodb.Table(os.environ["TABLA_PASOS"])
sfn_client = boto3.client("stepfunctions")

PASOS_VALIDOS = {"COCINA", "DESPACHO", "REPARTO"}



def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        tenant_id = body.get("tenant_id", "taco-bell")
        pedido_id = body.get("pedido_id")
        paso = (body.get("paso") or "").upper()
        usuario = body.get("usuario", "operador")
        observacion = body.get("observacion", "")

        # ── Validaciones ──────────────────────────────────────────────────
        if not pedido_id:
            log_event("WARN", "El campo pedido_id es obligatorio")
            return build_response(400, {"error": "El campo 'pedido_id' es obligatorio"})

        if paso not in PASOS_VALIDOS:
            log_event("WARN", f"Paso invalido: {paso}")
            return build_response(400, {"error": f"Paso inválido '{paso}'. Válidos: {', '.join(sorted(PASOS_VALIDOS))}"})

        # ── Buscar el task_token del paso PENDIENTE en DynamoDB ───────────
        respuesta = tabla.query(
            KeyConditionExpression=Key("tenant_id").eq(tenant_id),
            FilterExpression=Attr("pedido_id").eq(pedido_id)
            & Attr("paso").eq(paso)
            & Attr("estado").eq("PENDIENTE"),
        )

        items = respuesta.get("Items", [])

        if not items:
            log_event("WARN", f"No se encontro un paso {paso} pendiente para {pedido_id}")
            return build_response(404, {"error": f"No se encontró un paso '{paso}' PENDIENTE para el pedido '{pedido_id}'"})

        # Tomamos el más reciente si hay varios (ordenados por fecha_inicio desc)
        paso_pendiente = sorted(items, key=lambda x: x.get("fecha_inicio", ""), reverse=True)[0]
        task_token = paso_pendiente.get("task_token")
        paso_id = paso_pendiente["paso_id"]

        if not task_token:
            log_event("ERROR", "El paso pendiente no tiene task_token")
            return build_response(500, {"error": "El paso pendiente no tiene task_token registrado"})

        fecha_fin = datetime.now(timezone.utc).isoformat()

        # ── Actualizar estado del paso a COMPLETADO en DynamoDB ───────────
        tabla.update_item(
            Key={"tenant_id": tenant_id, "paso_id": paso_id},
            UpdateExpression=(
                "SET #estado = :completado, usuario = :usuario, "
                "observacion = :obs, fecha_fin = :fecha_fin"
            ),
            ExpressionAttributeNames={"#estado": "estado"},
            ExpressionAttributeValues={
                ":completado": "COMPLETADO",
                ":usuario": usuario,
                ":obs": observacion,
                ":fecha_fin": fecha_fin,
            },
        )

        # ── Notificar a Step Functions para reanudar el flujo ─────────────
        output = json.dumps(
            {
                "paso": paso,
                "pedido_id": pedido_id,
                "tenant_id": tenant_id,
                "usuario": usuario,
                "observacion": observacion,
                "completado_en": fecha_fin,
            }
        )

        sfn_client.send_task_success(taskToken=task_token, output=output)

        log_event("INFO", f"Paso {paso} completado", {"pedido_id": pedido_id})
        return build_response(200, {
            "mensaje": f"Paso '{paso}' completado. Workflow avanzado.",
            "pedido_id": pedido_id,
            "tenant_id": tenant_id,
            "paso": paso,
            "usuario": usuario,
            "completado_en": fecha_fin,
        })

    except sfn_client.exceptions.TaskDoesNotExist:
        log_event("ERROR", "Task token does not exist")
        return build_response(404, {"error": "El task_token no corresponde a ninguna tarea activa en Step Functions"})

    except sfn_client.exceptions.TaskTimedOut:
        log_event("ERROR", "Task token timed out")
        return build_response(410, {"error": "El task_token ha expirado. La tarea ya no está activa"})

    except Exception as e:
        log_event("ERROR", f"Error al avanzar paso: {str(e)}")
        return build_response(500, {"error": f"Error al avanzar el paso: {str(e)}"})
