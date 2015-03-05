from app import db

class DowntimeData(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  program_id = db.Column(db.Integer, db.ForeignKey('program.id'))
  downtime = db.Column(db.Float())
  config_changes = db.Column(db.Float())
  delivered = db.Column(db.Float())
  
  def calc_delivered(self):
    self.delivered = ((self.program.report.end - self.program.report.start).total_seconds() / (60*60)) - (self.downtime + self.config_changes)
    