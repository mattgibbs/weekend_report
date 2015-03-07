from app import db

class Program(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  report_id = db.Column(db.Integer, db.ForeignKey('report.id'))
  name = db.Column(db.String(30), nullable = False)
  time_note = db.Column(db.String(140))
  config_note = db.Column(db.String(140))
  performance_note = db.Column(db.String(140))
  other_notes = db.relationship('Note', backref='program', lazy='dynamic')
  downtime_data = db.relationship('DowntimeData', uselist=False, backref='program')
  display_order = db.Column(db.Integer)