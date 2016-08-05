from app import db

class Program(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  report_id = db.Column(db.Integer, db.ForeignKey('report.id'))
  name = db.Column(db.String(30), nullable = False)
  time_note = db.Column(db.String(140))
  config_note = db.Column(db.String(140))
  performance_note = db.Column(db.String(140))
  other_notes = db.relationship('Note', backref='program', lazy='dynamic', cascade="all, delete, delete-orphan", single_parent=True)
  downtime_data = db.relationship('DowntimeData', uselist=False, backref='program', cascade="all, delete, delete-orphan", single_parent=True)
  display_order = db.Column(db.Integer)
  
  def name_without_whitespace(self):
    return ''.join(self.name.split())
   
  def tag_id(self):
    return "p" + str(self.id) 
   
  def __repr__(self):
    return "<Program id: {0} name: {1}>".format(self.id, self.name)