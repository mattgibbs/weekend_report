from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config.from_object('config')
try:
	os.environ["WEEKENDREPORT_SETTINGS"]
	app.config.from_envvar('WEEKENDREPORT_SETTINGS')
	print "Running in production mode."
except KeyError:
	print "Running in development mode."
	

db = SQLAlchemy(app)

from app import models, views