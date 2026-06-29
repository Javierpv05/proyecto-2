#!/usr/bin/env python3
"""
limpiar_pedidos.py — Borra TODOS los pedidos de prueba (y sus pasos) de un
tenant/stage, y detiene las ejecuciones de Step Functions que hayan quedado
corriendo (RUNNING) por esos pedidos viejos.

Uso:
    python scripts/limpiar_pedidos.py [--stage dev|prod] [--tenant popeyes] [--yes]

Requiere credenciales AWS configuradas (mismo perfil que el deploy de Serverless).
Sin --yes, pide confirmacion antes de borrar (esto es destructivo, no hay deshacer).
"""
import argparse
import boto3
from boto3.dynamodb.conditions import Key


def limpiar(stage: str, tenant_id: str, confirmado: bool) -> None:
    region = "us-east-1"
    dynamodb = boto3.resource("dynamodb", region_name=region)
    tabla_pedidos = dynamodb.Table(f"pedidos-{stage}")
    tabla_pasos = dynamodb.Table(f"pedido_pasos-{stage}")

    pedidos = tabla_pedidos.query(KeyConditionExpression=Key("tenant_id").eq(tenant_id)).get("Items", [])
    pasos = tabla_pasos.query(KeyConditionExpression=Key("tenant_id").eq(tenant_id)).get("Items", [])

    print(f"\nTenant: {tenant_id} (stage: {stage})")
    print(f"  Pedidos encontrados: {len(pedidos)}")
    print(f"  Pasos encontrados:   {len(pasos)}")

    if not pedidos and not pasos:
        print("\nNo hay nada que borrar.\n")
        return

    if not confirmado:
        resp = input("\n¿Borrar TODO lo anterior? Esto no se puede deshacer. (escribe 'si' para confirmar): ")
        if resp.strip().lower() != "si":
            print("Cancelado, no se borró nada.\n")
            return

    for p in pedidos:
        tabla_pedidos.delete_item(Key={"tenant_id": tenant_id, "pedido_id": p["pedido_id"]})
    print(f"  ✅ {len(pedidos)} pedidos borrados.")

    for p in pasos:
        tabla_pasos.delete_item(Key={"tenant_id": tenant_id, "paso_id": p["paso_id"]})
    print(f"  ✅ {len(pasos)} pasos borrados.")

    # Detener ejecuciones RUNNING del workflow para no dejar Step Functions
    # esperando para siempre un task_token que ya borramos.
    sfn = boto3.client("stepfunctions", region_name=region)
    sts = boto3.client("sts", region_name=region)
    account_id = sts.get_caller_identity()["Account"]
    state_machine_arn = f"arn:aws:states:{region}:{account_id}:stateMachine:WorkflowPedido-{stage}"

    try:
        ejecuciones = sfn.list_executions(stateMachineArn=state_machine_arn, statusFilter="RUNNING").get("executions", [])
        for e in ejecuciones:
            sfn.stop_execution(executionArn=e["executionArn"], cause="Limpieza de datos de prueba")
        print(f"  ✅ {len(ejecuciones)} ejecuciones de Step Functions detenidas.")
    except Exception as e:
        print(f"  ⚠️  No se pudieron detener las ejecuciones de Step Functions: {e}")

    print("\nListo.\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Borra todos los pedidos/pasos de prueba de un tenant")
    parser.add_argument("--stage", default="dev", choices=["dev", "prod"], help="Stage de despliegue (default: dev)")
    parser.add_argument("--tenant", default="popeyes", help="Tenant ID (default: popeyes)")
    parser.add_argument("--yes", action="store_true", help="No pedir confirmacion (usar con cuidado)")
    args = parser.parse_args()
    limpiar(args.stage, args.tenant, args.yes)
