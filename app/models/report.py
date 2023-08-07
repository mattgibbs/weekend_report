from datetime import datetime
from dateutil import parser

from app import db, timeconverter
from .program import Program
from .note import Note
from .history_plot import HistoryPlot
from .history_event import HistoryEvent
from .downtime_data import DowntimeData

class Report(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  start = db.Column(db.DateTime(), nullable = False)
  end = db.Column(db.DateTime(), nullable = False)
  programs = db.relationship('Program', backref='report', lazy='dynamic', cascade="all, delete, delete-orphan")
  history_plots = db.relationship('HistoryPlot', backref='report', lazy='dynamic', cascade="all, delete, delete-orphan")
  
  def local_start(self):
    return timeconverter.convert_to_local(self.start)
    
  def local_end(self):
    return timeconverter.convert_to_local(self.end)
  
  def report_items(self):
    report_items = []
    report_items.extend(self.programs.all())
    report_items.extend(self.history_plots.all())
    report_items.sort(key=lambda report_item: report_item.display_order)
    return report_items
  
  def from_form(self, form):
    print("About to save report from the following form data:")
    print(form)
    #Parse the start time string and convert to UTC before storing it.
    local_start = parser.parse(form['start'], ignoretz = True)
    local_start = local_start.replace(hour=8)
    self.start = timeconverter.convert_to_UTC(local_start)
    #Parse the end time string and convert to UTC before storing it.
    local_end = parser.parse(form['end'], ignoretz = True)
    local_end = local_end.replace(hour=8)
    self.end = timeconverter.convert_to_UTC(local_end)
  
    programs = filter(None, form.getlist('program'))
    self.programs = []
    for program_number in programs:
      programid = -1
      try:
        programid = int(program_number)
      except:
        #If the id isnt an integer, we'll just assume this is a new program.
        pass
        
      prog = Program.query.get(programid)
      if not prog:
        prog = Program()
      db.session.add(prog)     
      prog.name = form['name-' + program_number]
      prog.time_note = form['time_note-' + program_number]
      prog.config_note = form['config_note-' + program_number]
      prog.performance_note = form['performance_note-' + program_number]
      try:
        prog.display_order = int(form['program-order-' + program_number])
      except ValueError:
        pass
      prog.report = self
      
      other_note_numbers = filter(None, form.getlist('program[' + program_number + ']note'))
      prog.other_notes = []
      for other_note_number in other_note_numbers:
        noteid = -1
        try:
          noteid = int(other_note_number)
        except ValueError:
          print("Couldn't convert " + other_note_number + " to int.")
        
        note = Note.query.get(noteid)
        #If we didn't get a note back in the query, assume that means we need to make a new note.
        if not note:
          note = Note()
        note_text = form["program[{0}]note[{1}]-text".format(program_number, other_note_number)]
        #If the note from the form has no text, we just ignore it.
        if note_text:
          note.program = prog
          note.text = note_text
          db.session.add(note)
        else:
          print("No text in note {0}".format(other_note_number))
          
      new_downtime = DowntimeData()
      prog.downtime_data = None
      if form['downtime-' + program_number]:
        try:
          new_downtime.downtime = float(form['downtime-' + program_number])
        except ValueError:
          new_downtime.downtime = None
      else:
        new_downtime.downtime = None
      if form['config_changes-' + program_number]:
        try:
          new_downtime.config_changes = float(form['config_changes-' + program_number])
        except ValueError:
          new_downtime.config_changes = None
      else:
        new_downtime.config_changes = None
      if form['delivered-' + program_number]:
        try:
          new_downtime.delivered = float(form['delivered-' + program_number])
        except ValueError:
          new_downtime.delivered = None
      else:
        new_downtime.delivered = None
      if form['tuning-' + program_number]:
        try:
          new_downtime.tuning = float(form['tuning-' + program_number])
        except ValueError:
          new_downtime.tuning = None
      else:
        new_downtime.tuning = None
      new_downtime.program = prog
      db.session.add(new_downtime)
      
    history_plots = filter(None, form.getlist('history_plot'))
    self.history_plots = []
    for plot_number in history_plots:
      plot = None
      try:
        plotid = int(plot_number)
        plot = HistoryPlot.query.get(plotid)
      except ValueError:
        pass
      
      #If the user doesn't specify a PV, assume they don't want a plot at all.  
      if not form['pv-' + plot_number]:
        continue  
      
      if not plot:
        plot = HistoryPlot()
      plot.report = self
      plot.pv = form['pv-' + plot_number]
      plot.title = form['plot-title-' + plot_number]
      db.session.add(plot)
      
      
      try:
        plot.display_order = int(form['plot-order-' + plot_number])
      except ValueError:
        pass
        
      events = form.getlist("plot[{0}]event".format(plot_number))
      plot.events = []
      for event_number in events:
        event = None
        try:
          eventid = int(event_number)
          event = HistoryEvent.query.get(eventid)
        except ValueError:
          pass
          
        if not event:
          event = HistoryEvent()
        event.text = form["plot[{0}]event[{1}]-text".format(plot_number, event_number)]
        if not event.text:
          continue
        local_timestring = form["plot[{0}]event[{1}]-timestamp".format(plot_number, event_number)]
        if not local_timestring:
          continue
        event.history_plot = plot
        local_timestamp = parser.parse(local_timestring, ignoretz = True)
        event.timestamp = timeconverter.convert_to_UTC(local_timestamp)
        db.session.add(event)
