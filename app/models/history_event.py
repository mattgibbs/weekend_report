from app import db

class HistoryEvent(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  history_plot_id = db.Column(db.Integer, db.ForeignKey('history_plot.id'))
  timestamp = db.Column(db.DateTime(), nullable = False)
  text = db.Column(db.String(60), nullable = False)
  
  def utc_iso_string(self):
    return self.timestamp.isoformat() + '.000Z'
    
  def __repr__(self):
    return "<HistoryEvent id: {0} history_plot_id: {1}>".format(self.id, self.history_plot)