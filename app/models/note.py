from app import db

class Note(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  program_id = db.Column(db.Integer, db.ForeignKey('program.id'))
  text = db.Column(db.Text(), nullable = False)
  
  def __repr__(self):
    return "<Note id: {0} program_id: {1} text: {2}>".format(self.id, self.program, self.text)