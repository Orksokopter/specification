import json
import os
from orksokopter_specification import db, Message, Parameter, Text

data_path = os.path.join(os.path.dirname(__file__), 'old_data')

DATABASE_FILE = os.path.join(os.path.dirname(__file__), 'data', 'database.db')

if os.path.exists(DATABASE_FILE):
    os.unlink(DATABASE_FILE)
db.create_all()

messages = open(os.path.join(data_path, 'messages_data_storage.json'), 'r', encoding="UTF-8").read()
messages = json.loads(messages)

for message in messages:
    db_message = Message()
    db_message.type_id = message['type_id']
    db_message.key = message['key']
    db_message.data = message['data']
    db_message.flags = json.dumps(message['flags'])
    db.session.add(db_message)

parameters = open(os.path.join(data_path, 'parameters_data_storage.json'), 'r', encoding="UTF-8").read()
parameters = json.loads(parameters)

for parameter in parameters:
    db_parameter = Parameter()
    db_parameter.type_id = parameter['type_id']
    db_parameter.key = parameter['key']
    db.session.add(db_parameter)

specs = open(os.path.join(data_path, 'spec_data_storage.html'), 'r', encoding="UTF-8").read()

db_specs = Text()
db_specs.key = 'specs'
db_specs.text = specs
db.session.add(db_specs)

db.session.commit()
