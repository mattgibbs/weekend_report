from app import db

class DowntimeData(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  program_id = db.Column(db.Integer, db.ForeignKey('program.id'))
  downtime = db.Column(db.Float())
  config_changes = db.Column(db.Float())
  delivered = db.Column(db.Float())