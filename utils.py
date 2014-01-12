import json


def return_json(data):
    return json.dumps(data), 200, {
        "Content-Type": "application/json"
    }
