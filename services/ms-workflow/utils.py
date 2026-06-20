import json
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def convert_to_decimal(obj):
    if isinstance(obj, list):
        return [convert_to_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, (float, int)) and not isinstance(obj, bool):
        return decimal.Decimal(str(obj))
    else:
        return obj

def build_response(status_code, body):
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
    log_entry = {
        'level': level,
        'message': message
    }
    if data is not None:
        log_entry['data'] = data
    print(json.dumps(log_entry, cls=DecimalEncoder))
