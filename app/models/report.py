from datetime import datetime
from dateutil import parser

from app import db, timeconverter
from program import Program
from note import Note
from history_plot import HistoryPlot
from history_event import HistoryEvent
from downtime_data import DowntimeData

class Report(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  start = db.Column(db.DateTime(), nullable = False)
  end = db.Column(db.DateTime(), nullable = False)
  programs = db.relationship('Program', backref='report', lazy='dynamic')
  history_plots = db.relationship('HistoryPlot', backref='report', lazy='dynamic')
  
  def from_form(self, form):
    #Parse the start time string and convert to UTC before storing it.
    local_start = parser.parse(form['start'], ignoretz = True)
    local_start.replace(hour=8)
    self.start = timeconverter.convert_to_UTC(local_start)
  
    #Parse the end time string and convert to UTC before storing it.
    local_end = parser.parse(form['end'], ignoretz = True)
    local_end.replace(hour=8)
    self.end = timeconverter.convert_to_UTC(local_end)
  
    programs = filter(None, form.getlist('program'))
    for program_number in programs:
      new_program = Program()
      new_program.report = self
      new_program.name = form['name-' + program_number]
      new_program.time_note = form['time_note-' + program_number]
      new_program.config_note = form['config_note-' + program_number]
      new_program.performance_note = form['performance_note-' + program_number]
      new_program.display_order = int(form['program-order-' + program_number])
      other_notes = filter(None, form.getlist('other_note-' + program_number))
      for other_note in other_notes:
        new_note = Note()
        new_note.program = new_program
        new_note.text = other_note
      new_downtime = DowntimeData()
      new_downtime.program = new_program
      if form['downtime-' + program_number]:
        new_downtime.downtime = float(form['downtime-' + program_number])
      else:
        new_downtime.downtime = 0
      if form['config_changes-' + program_number]:
        new_downtime.config_changes = float(form['config_changes-' + program_number])
      else:
        new_downtime.config_changes = 0
      if form['delivered-' + program_number]:
        new_downtime.delivered = float(form['delivered-' + program_number])
      else:
        new_downtime.delivered = 0
      
    history_plots = filter(None, form.getlist('history_plot'))
    for plot_number in history_plots:
      new_plot = HistoryPlot()
      new_plot.report = self
      new_plot.pv = form['pv-' + plot_number]
      new_plot.display_order = int(form['plot-order-' + plot_number])
      events = form.getlist("plot[{0}]event".format(plot_number))
      for event_number in events:
        new_event = HistoryEvent()
        new_event.text = form["plot[{0}]event[{1}]-text".format(plot_number, event_number)]
        if not new_event.text:
          continue
        local_timestring = form["plot[{0}]event[{1}]-timestamp".format(plot_number, event_number)]
        if not local_timestring:
          continue
        new_event.history_plot = new_plot
        local_timestamp = parser.parse(local_timestring, ignoretz = True)
        new_event.timestamp = timeconverter.convert_to_UTC(local_timestamp)