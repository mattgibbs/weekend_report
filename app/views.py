from flask import render_template, flash, redirect, url_for, request
from app import app, db, models, timeconverter
from datetime import datetime
from dateutil import parser

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
  new_report = models.Report()
  print(request.form)
  try:
    db.session.add(new_report)
    #Parse the start time string and convert to UTC before storing it.
    local_start = parser.parse(request.form['start'], ignoretz = True)
    local_start.replace(hour=8)
    new_report.start = timeconverter.convert_to_UTC(local_start)
  
    #Parse the end time string and convert to UTC before storing it.
    local_end = parser.parse(request.form['end'], ignoretz = True)
    local_end.replace(hour=8)
    new_report.end = timeconverter.convert_to_UTC(local_end)
  
    programs = filter(None, request.form.getlist('program'))
    for program_number in programs:
      new_program = models.Program()
      db.session.add(new_program)
      new_program.report = new_report
      new_program.name = request.form['name-' + program_number]
      new_program.time_note = request.form['time_note-' + program_number]
      new_program.config_note = request.form['config_note-' + program_number]
      new_program.performance_note = request.form['performance_note-' + program_number]
      new_program.display_order = int(request.form['program-order-' + program_number])
      other_notes = filter(None, request.form.getlist('other_note-' + program_number))
      for other_note in other_notes:
        new_note = models.Note()
        db.session.add(new_note)
        new_note.program = new_program
        new_note.text = other_note
      new_downtime = models.DowntimeData()
      db.session.add(new_downtime)
      new_downtime.program = new_program
      if request.form['downtime-' + program_number]:
        new_downtime.downtime = float(request.form['downtime-' + program_number])
      else:
        new_downtime.downtime = 0
      if request.form['config_changes-' + program_number]:
        new_downtime.config_changes = float(request.form['config_changes-' + program_number])
      else:
        new_downtime.config_changes = 0
      new_downtime.calc_delivered()
    
    history_plots = filter(None, request.form.getlist('history_plot'))
    for plot_number in history_plots:
      new_plot = models.HistoryPlot()
      db.session.add(new_plot)
      new_plot.report = new_report
      new_plot.pv = request.form['pv-' + plot_number]
      new_plot.display_order = int(request.form['plot-order-' + plot_number])
      events = request.form.getlist("plot[{0}]event".format(plot_number))
      for event_number in events:
        new_event = models.HistoryEvent()
        new_event.text = request.form["plot[{0}]event[{1}]-text".format(plot_number, event_number)]
        if not new_event.text:
          continue
        local_timestring = request.form["plot[{0}]event[{1}]-timestamp".format(plot_number, event_number)]
        if not local_timestring:
          continue
        db.session.add(new_event)
        new_event.history_plot = new_plot
        local_timestamp = parser.parse(local_timestring, ignoretz = True)
        new_event.timestamp = timeconverter.convert_to_UTC(local_timestamp)
        
    db.session.commit()
  except:
    db.session.rollback()
    raise
  
  flash('New report saved. <a href="' + url_for('show_report', reportid = new_report.id) + '">Click here to view it.</a>')
  return redirect(url_for('report_index'))
    
  