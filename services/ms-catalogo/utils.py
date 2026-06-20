import json
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def convert_to_decimal(obj):
    """
    Recursively converts float and integer values in a dictionary or list
    to Decimal. This is required for storing numbers in DynamoDB.
    """
    if isinstance(obj, list):
        return [convert_to_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, (float, int)) and not isinstance(obj, bool):
        # We convert to string first to avoid floating point precision issues
        return decimal.Decimal(str(obj))
    else:
        return obj

def build_response(status_code, body):
    """
    Builds a consistent response object with CORS headers and proper JSON encoding
    (handling Decimals).
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def log_event(level, message, data=None):
    """
    Logs structured JSON to stdout so CloudWatch can parse it.
    """
    log_entry = {
        'level': level,
        'message': message
    }
    if data is not None:
        log_entry['data'] = data
    print(json.dumps(log_entry, cls=DecimalEncoder))
