from flask import render_template, flash, redirect, url_for, request
from app import app, db, models
from datetime import datetime

@app.route('/')
def root_index():
	return "Welcome to the weekend report."
  
@app.route('/reports/')
def report_index():
  reports = db.session.query(models.Report)
  reports.order_by('end desc')
  return render_template("report_index.html", reports=reports)

@app.route('/reports/<int:reportid>/')
def show_report(reportid = None):
  report = db.session.query(models.Report).get(reportid)
  if report == None:
    abort(404)
  return render_template("show_report.html", report=report)