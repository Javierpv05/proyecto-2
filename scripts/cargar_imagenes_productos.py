#!/usr/bin/env python3
"""
cargar_imagenes_productos.py — Sube muchas imagenes de una sola vez y las
asocia a sus productos, sin tener que entrar al admin y subir una por una.

Dos formas de usarlo:

OPCION A — renombrando archivos (sin mapeo):
1. python scripts/cargar_imagenes_productos.py --listar --stage dev
2. Renombra cada imagen EXACTAMENTE como el slug que te imprimio (ej.
   pollo-frito-clasico-3-piezas.jpg), todas en una misma carpeta.
3. python scripts/cargar_imagenes_productos.py --carpeta ./mis_imagenes --stage dev

OPCION B — con un archivo de mapeo (no hay que renombrar nada, ej. puedes
dejar imagen1.jpg, imagen2.jpg, etc.):
1. python scripts/cargar_imagenes_productos.py --generar-mapeo mapeo.csv --stage dev
   (esto crea mapeo.csv con una fila por producto, columna 'archivo' vacia)
2. Abre mapeo.csv y en la columna 'archivo' escribe el nombre de archivo que
   le pusiste a cada imagen (ej. imagen1.jpg), una fila por producto.
3. python scripts/cargar_imagenes_productos.py --carpeta ./mis_imagenes --mapeo mapeo.csv --stage dev

Requiere credenciales AWS configuradas (mismo perfil que el deploy de Serverless).
"""
import argparse
import csv
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


def generar_mapeo(stage: str, tenant_id: str, salida: str) -> None:
    productos = obtener_productos(stage, tenant_id)
    with open(salida, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["archivo", "producto"])
        for p in productos:
            writer.writerow(["", p["nombre"]])
    print(f"\n✅ Creado '{salida}' con {len(productos)} filas.")
    print("   Abrelo, completa la columna 'archivo' con el nombre que le pusiste")
    print("   a cada imagen (ej. imagen1.jpg), y guarda.\n")


def _subir_y_asociar(s3, tabla, bucket, tenant_id, archivo: Path, producto) -> None:
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
    print(f"  ✅ {archivo.name:<30} -> {producto['nombre']}")


def cargar_con_mapeo(stage: str, tenant_id: str, carpeta: str, mapeo_path: str) -> None:
    carpeta_path = Path(carpeta)
    if not carpeta_path.is_dir():
        print(f"ERROR: '{carpeta}' no es una carpeta válida.")
        return

    productos = obtener_productos(stage, tenant_id)
    nombre_a_producto = {p["nombre"]: p for p in productos}

    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    tabla = dynamodb.Table(f"productos-{stage}")
    s3 = boto3.client("s3", region_name=REGION)
    sts = boto3.client("sts", region_name=REGION)
    account_id = sts.get_caller_identity()["Account"]
    bucket = f"popeyes-images-{stage}-{account_id}"

    subidos = 0
    sin_completar = []
    sin_archivo = []

    with open(mapeo_path, encoding="utf-8") as f:
        for fila in csv.DictReader(f):
            archivo_nombre = (fila.get("archivo") or "").strip()
            producto_nombre = (fila.get("producto") or "").strip()

            if not archivo_nombre:
                sin_completar.append(producto_nombre)
                continue

            ruta_archivo = carpeta_path / archivo_nombre
            if not ruta_archivo.is_file():
                sin_archivo.append((archivo_nombre, producto_nombre))
                continue

            producto = nombre_a_producto.get(producto_nombre)
            if not producto:
                print(f"  ⚠️  Producto '{producto_nombre}' no encontrado en la base, se omite.")
                continue

            _subir_y_asociar(s3, tabla, bucket, tenant_id, ruta_archivo, producto)
            subidos += 1

    print(f"\nResumen: {subidos} imágenes subidas y asociadas.")
    if sin_archivo:
        print(f"\n⚠️  {len(sin_archivo)} fila(s) con archivo que no existe en '{carpeta}':")
        for archivo_nombre, producto_nombre in sin_archivo:
            print(f"     - {archivo_nombre} ({producto_nombre})")
    if sin_completar:
        print(f"\nℹ️  {len(sin_completar)} producto(s) sin fila de archivo completada en el mapeo:")
        for nombre in sin_completar:
            print(f"     - {nombre}")
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

        _subir_y_asociar(s3, tabla, bucket, tenant_id, archivo, producto)
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
    parser.add_argument("--listar", action="store_true", help="Solo muestra los nombres de archivo esperados (opcion A), no sube nada")
    parser.add_argument("--generar-mapeo", metavar="ARCHIVO.csv", help="Genera una plantilla CSV para la opcion B (mapeo manual), no sube nada")
    parser.add_argument("--mapeo", metavar="ARCHIVO.csv", help="Usa un CSV de mapeo (opcion B) en vez de adivinar por nombre de archivo")
    args = parser.parse_args()

    if args.listar:
        listar_slugs(args.stage, args.tenant)
    elif args.generar_mapeo:
        generar_mapeo(args.stage, args.tenant, args.generar_mapeo)
    elif args.carpeta and args.mapeo:
        cargar_con_mapeo(args.stage, args.tenant, args.carpeta, args.mapeo)
    elif args.carpeta:
        cargar(args.stage, args.tenant, args.carpeta)
    else:
        parser.error("Usa --listar, --generar-mapeo <archivo>, o --carpeta <ruta> [--mapeo <archivo>] para subir imagenes.")
