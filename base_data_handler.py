import json
from flask import request
from utils import return_json


class BaseDataHandler:
    def __init__(self, db, model, model_field_names, json_fields=None):
        self.db = db
        self.model = model
        self.model_field_names = model_field_names
        self.json_fields = json_fields if json_fields is not None else []

    def list(self):
        result = []
        for model_instance in self.model.query.all():
            result.append(model_instance.dump())

        return return_json(result)

    def create(self):
        tmp = json.loads(request.form['entries'])

        db_instance = self.model()
        for attr in self.model_field_names:
            if attr in self.json_fields:
                setattr(db_instance, attr, json.dumps(tmp[attr]))
            else:
                setattr(db_instance, attr, tmp[attr])

        self.db.session.add(db_instance)
        self.db.session.commit()

        return return_json({
            'success': True,
            'entries': db_instance.dump()
        })

    def destory(self):
        tmp = json.loads(request.form['entries'])

        db_instance = self.model.query.filter_by(id=tmp['index']).first()
        self.db.session.delete(db_instance)
        self.db.session.commit()

        return return_json({"success": True})

    def update(self):
        tmp = json.loads(request.form['entries'])

        db_instance = self.model.query.filter_by(id=tmp['index']).first()

        for attr in self.model_field_names:
            if attr in self.json_fields:
                setattr(db_instance, attr, json.dumps(tmp[attr]))
            else:
                setattr(db_instance, attr, tmp[attr])

        self.db.session.add(db_instance)
        self.db.session.commit()

        return return_json({
            "success": True,
            "entries": tmp
        })
