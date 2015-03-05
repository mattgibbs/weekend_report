from app import db

class HistoryPlot(db.Model):
	id = db.Column(db.Integer, primary_key = True)
	report_id = db.Column(db.Integer, db.ForeignKey('report.id'))
	pv = db.Column(db.String(140), nullable = False)
	events = db.relationship('HistoryEvent', backref='history_plot', lazy='dynamic')
	archiver_json = db.Column(db.Text())