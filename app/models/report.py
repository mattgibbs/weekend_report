from app import db

class Report(db.Model):
	id = db.Column(db.Integer, primary_key = True)
	start = db.Column(db.DateTime(), nullable = False)
	end = db.Column(db.DateTime(), nullable = False)
	programs = db.relationship('Program', backref='report', lazy='dynamic')
	history_plots = db.relationship('HistoryPlot', backref='report', lazy='dynamic')