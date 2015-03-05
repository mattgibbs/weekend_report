from app import db

class Note(db.Model):
	id = db.Column(db.Integer, primary_key = True)
	program_id = db.Column(db.Integer, db.ForeignKey('program.id'))
	text = db.Column(db.Text(), nullable = False)