from flask import render_template, flash, redirect, url_for, request
from app import app, db, models


@app.route('/')
def root_index():
	return redirect(url_for('report_index'))
  
@app.route('/reports/')
def report_index():
  reports = db.session.query(models.Report)
  reports = reports.order_by('end desc')
  return render_template("report_index.html", reports=reports)

@app.route('/reports/<int:reportid>/')
def show_report(reportid = None):
  report = db.session.query(models.Report).get(reportid)
  if report == None:
    abort(404)
  report_items = []
  report_items.extend(report.programs.all())
  report_items.extend(report.history_plots.all())
  report_items.sort(key=lambda report_item: report_item.display_order)
  
  return render_template("show_report.html", report=report, report_items=report_items)
  
@app.route('/reports/new/')
def new_report():
  return render_template("report_form.html", report=None)
  
@app.route('/create/', methods=['POST'])
def create_report():
  
  print(request.form)
  report = models.Report()
  db.session.add(report)
  try:
    report.from_form(request.form)
    db.session.commit()
  except:
    db.session.rollback()
    raise
  
  flash('New report saved. <a href="' + url_for('show_report', reportid = report.id) + '">Click here to view it.</a>')
  return redirect(url_for('report_index'))
    
  