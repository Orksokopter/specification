import json
import os
import platform
from flask import Flask, render_template, Markup, request
from flask.ext.sqlalchemy import SQLAlchemy
from base_data_handler import BaseDataHandler

app = Flask(__name__)
app.jinja_env.filters['json'] = lambda v: Markup(json.dumps(v))
app.jinja_env.filters['hex'] = lambda v, c: Markup("{0:#0{1}x}".format(v, c+2))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.dirname(__file__) + '/data/database.db'
db = SQLAlchemy(app)

if platform.node() == "musashi":
    app.debug = True


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type_id = db.Column(db.Integer, unique=True)
    key = db.Column(db.String(255), unique=True)
    data = db.Column(db.String(255))
    flags = db.Column(db.String(255), default="[]")

    def dump(self):
        return {
            'index': self.id,
            'type_id': self.type_id,
            'key': self.key,
            'data': self.data,
            'flags': json.loads(self.flags)
        }


class Parameter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type_id = db.Column(db.Integer, unique=True)
    key = db.Column(db.String(255), unique=True)

    def dump(self):
        return {
            'index': self.id,
            'type_id': self.type_id,
            'key': self.key,
        }


class Text(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(255), unique=True)
    text = db.Column(db.Text)


messages_handler = BaseDataHandler(db, Message, ['type_id', 'key', 'data', 'flags'], ['flags'])
parameters_handler = BaseDataHandler(db, Parameter, ['type_id', 'key'])


@app.route('/messages')
def messages():
    return messages_handler.list()


@app.route('/messages/create', methods=['POST'])
def messages_create():
    return messages_handler.create()


@app.route('/messages/destroy', methods=['POST'])
def messages_destroy():
    return messages_handler.destory()


@app.route('/messages/update', methods=['POST'])
def messages_update():
    return messages_handler.update()


@app.route('/messages/as/c_enum')
def messages_as_c_enum():
    return render_template(
        'exports/c_enum.txt',
        lines=Message.query.all(),
        enum_name='message_type',
        enum_prefix='MSG_'
    ), 200, {
        "Content-Type": "text/plain"
    }


@app.route('/messages/as/c++_enum')
def messages_as_cpp_enum():
    return render_template(
        'exports/cpp_enum.txt',
        lines=Message.query.all(),
        class_name='MessageTypes',
    ), 200, {
        "Content-Type": "text/plain"
    }


@app.route('/messages/as/python_class')
def messages_as_python_class():
    return render_template(
        'exports/python_class.txt',
        lines=Message.query.all(),
        class_name='MessageTypes',
        attribute_prefix='MSG_',
    ), 200, {
        'Content-Type': 'text/plain'
    }


@app.route('/parameters')
def parameters():
    return parameters_handler.list()


@app.route('/parameters/create', methods=['POST'])
def parameters_create():
    return parameters_handler.create()


@app.route('/parameters/destroy', methods=['POST'])
def parameters_destroy():
    return parameters_handler.destory()


@app.route('/parameters/update', methods=['POST'])
def parameters_update():
    return parameters_handler.update()


@app.route('/parameters/as/c_enum')
def parameters_as_c_enum():
    return render_template(
        'exports/c_enum.txt',
        lines=Parameter.query.all(),
        enum_name='parameter_type',
        enum_prefix='PARAM_'
    ), 200, {
        "Content-Type": "text/plain"
    }


@app.route('/parameters/as/c++_enum')
def parameters_as_cpp_enum():
    return render_template(
        'exports/cpp_enum.txt',
        lines=Parameter.query.all(),
        class_name='Parameters',
    ), 200, {
        "Content-Type": "text/plain"
    }


@app.route('/parameters/as/python_class')
def parameters_as_python_class():
    return render_template(
        'exports/python_class.txt',
        lines=Parameter.query.all(),
        class_name='Parameters'
    ), 200, {
        'Content-Type': 'text/plain'
    }


@app.route('/specs', methods=['POST', 'GET'])
def specs():
    db_specs = Text.query.filter_by(key="specs").first()

    if request.method == 'POST':
        db_specs.text = request.form['new_html']
        db.session.add(db_specs)
        db.session.commit()
        return ''
    else:
        return db_specs.text


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
