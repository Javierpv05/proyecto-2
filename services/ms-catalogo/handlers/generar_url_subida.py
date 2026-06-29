"""
generar_url_subida.py — POST /productos/upload-url (protegido con Cognito)

Genera una URL prefirmada de S3 para que el frontend suba la imagen de un
producto directamente al bucket (sin pasar el binario por Lambda/API
Gateway). El frontend hace PUT a 'upload_url' y luego guarda 'public_url'
en el campo 'imagen_url' al crear/editar el producto.

Body esperado:
{
    "content_type": "image/jpeg"   (opcional, default image/jpeg)
}
"""
import json
import os
import uuid
import boto3
from utils import build_response, log_event

s3_client = boto3.client("s3")
BUCKET_NAME = os.environ["BUCKET_NAME"]
REGION = os.environ.get("AWS_REGION", "us-east-1")


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
        content_type = body.get("content_type", "image/jpeg")
        extension = content_type.split("/")[-1] if "/" in content_type else "jpg"

        key = f"productos/{uuid.uuid4().hex}.{extension}"

        upload_url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": BUCKET_NAME, "Key": key, "ContentType": content_type},
            ExpiresIn=300,
        )

        public_url = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{key}"

        log_event("INFO", "URL de subida generada", {"key": key})
        return build_response(200, {"upload_url": upload_url, "public_url": public_url})
    except Exception as e:
        log_event("ERROR", f"Error al generar URL de subida: {str(e)}")
        return build_response(500, {"error": f"Error al generar URL de subida: {str(e)}"})
