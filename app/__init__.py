from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.config.from_object('config')
app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
)
try:
	os.environ["WEEKENDREPORT_SETTINGS"]
	app.config.from_envvar('WEEKENDREPORT_SETTINGS')
	print("Running in production mode.")
except KeyError:
	print("Running in development mode.")
	

db = SQLAlchemy(app)

from app import models, views
