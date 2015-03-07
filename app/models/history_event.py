from app import db

class HistoryEvent(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  history_plot_id = db.Column(db.Integer, db.ForeignKey('history_plot.id'))
  timestamp = db.Column(db.DateTime(), nullable = False)
  text = db.Column(db.String(60), nullable = False)
  
  def utc_iso_string(self):
    return self.timestamp.isoformat() + '.000Z'