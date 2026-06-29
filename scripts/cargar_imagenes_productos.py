#!/usr/bin/env python3
"""
cargar_imagenes_productos.py — Sube muchas imagenes de una sola vez y las
asocia a sus productos por nombre de archivo, sin tener que entrar al admin
y subir una por una.

Como usarlo:
1. Corre primero en modo --listar para ver el nombre de archivo esperado de
   cada producto (un "slug" basado en su nombre):
       python scripts/cargar_imagenes_productos.py --listar --stage dev

2. Pon tus imagenes en una carpeta, nombrando cada archivo EXACTAMENTE como
   el slug de la lista (ej. pollo-frito-clasico-3-piezas.jpg).

3. Corre el script apuntando a esa carpeta:
       python scripts/cargar_imagenes_productos.py --carpeta ./mis_imagenes --stage dev

Requiere credenciales AWS configuradas (mismo perfil que el deploy de Serverless).
"""
import argparse
import mimetypes
import re
import unicodedata
import uuid
from pathlib import Path

import boto3
from boto3.dynamodb.conditions import Key

REGION = "us-east-1"


def slugify(texto: str) -> str:
    texto = texto.lower()
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = re.sub(r"[^a-z0-9]+", "-", texto).strip("-")
    return texto


def obtener_productos(stage: str, tenant_id: str):
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    tabla = dynamodb.Table(f"productos-{stage}")
    return tabla.query(KeyConditionExpression=Key("tenant_id").eq(tenant_id)).get("Items", [])


def listar_slugs(stage: str, tenant_id: str) -> None:
    productos = obtener_productos(stage, tenant_id)
    print(f"\nNombres de archivo esperados ({len(productos)} productos):\n")
    for p in productos:
        tiene_imagen = "ya tiene imagen" if p.get("imagen_url") else "sin imagen"
        print(f"  {slugify(p['nombre'])}.jpg   <- {p['nombre']}  ({tiene_imagen})")
    print()


def cargar(stage: str, tenant_id: str, carpeta: str) -> None:
    carpeta_path = Path(carpeta)
    if not carpeta_path.is_dir():
        print(f"ERROR: '{carpeta}' no es una carpeta válida.")
        return

    productos = obtener_productos(stage, tenant_id)
    slug_a_producto = {slugify(p["nombre"]): p for p in productos}

    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    tabla = dynamodb.Table(f"productos-{stage}")
    s3 = boto3.client("s3", region_name=REGION)
    sts = boto3.client("sts", region_name=REGION)
    account_id = sts.get_caller_identity()["Account"]
    bucket = f"popeyes-images-{stage}-{account_id}"

    archivos = [f for f in carpeta_path.iterdir() if f.is_file()]
    print(f"\n📁 {len(archivos)} archivos encontrados en '{carpeta}'")
    print(f"🪣 Bucket: {bucket}\n")

    subidos = 0
    sin_match = []

    for archivo in archivos:
        slug_archivo = slugify(archivo.stem)
        producto = slug_a_producto.get(slug_archivo)

        if not producto:
            sin_match.append(archivo.name)
            continue

        content_type = mimetypes.guess_type(archivo.name)[0] or "image/jpeg"
        extension = archivo.suffix.lstrip(".") or "jpg"
        key = f"productos/{uuid.uuid4().hex}.{extension}"

        s3.upload_file(str(archivo), bucket, key, ExtraArgs={"ContentType": content_type})
        public_url = f"https://{bucket}.s3.{REGION}.amazonaws.com/{key}"

        tabla.update_item(
            Key={"tenant_id": tenant_id, "producto_id": producto["producto_id"]},
            UpdateExpression="SET imagen_url = :u",
            ExpressionAttributeValues={":u": public_url},
        )

        print(f"  ✅ {archivo.name:<45} -> {producto['nombre']}")
        subidos += 1

    print(f"\nResumen: {subidos} imágenes subidas y asociadas.")
    if sin_match:
        print(f"\n⚠️  {len(sin_match)} archivo(s) sin producto que coincida (revisa el nombre):")
        for nombre in sin_match:
            print(f"     - {nombre}")
    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Carga masiva de imagenes de productos")
    parser.add_argument("--stage", default="dev", choices=["dev", "prod"], help="Stage de despliegue (default: dev)")
    parser.add_argument("--tenant", default="popeyes", help="Tenant ID (default: popeyes)")
    parser.add_argument("--carpeta", help="Carpeta local con las imagenes a subir")
    parser.add_argument("--listar", action="store_true", help="Solo muestra los nombres de archivo esperados, no sube nada")
    args = parser.parse_args()

    if args.listar:
        listar_slugs(args.stage, args.tenant)
    elif args.carpeta:
        cargar(args.stage, args.tenant, args.carpeta)
    else:
        parser.error("Usa --listar para ver los nombres esperados, o --carpeta <ruta> para subir imagenes.")
