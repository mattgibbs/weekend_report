from app import db

class DowntimeData(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  program_id = db.Column(db.Integer, db.ForeignKey('program.id'))
  downtime = db.Column(db.Float())
  config_changes = db.Column(db.Float())
  delivered = db.Column(db.Float())
  tuning = db.Column(db.Float())
  
  def is_empty(self):
    if self.downtime or self.config_changes or self.delivered or self.tuning:
      return False
    return True
  
  def __repr__(self):
    return "<DowntimeData id: {0} program: {1}>".format(self.id, self.program)