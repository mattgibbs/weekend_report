from app import db
import requests

class HistoryPlot(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  report_id = db.Column(db.Integer, db.ForeignKey('report.id'))
  pv = db.Column(db.String(140), nullable = False)
  title = db.Column(db.String(140))
  events = db.relationship('HistoryEvent', backref='history_plot', lazy='dynamic', cascade="all, delete, delete-orphan", single_parent=True)
  archiver_json = db.Column(db.Text())
  display_order = db.Column(db.Integer)
  
  def archiver_url(self):
    base_url_string = "http://lcls-archapp.slac.stanford.edu/retrieval/data/getData.json?pv=mean_360({0})&from={1}&to={2}"
    return base_url_string.format(self.pv, self.report.start.strftime('%Y-%m-%dT%H:%M:%S.000Z'), self.report.end.strftime('%Y-%m-%dT%H:%M:%S.000Z'))
    
  def get_archiver_data(self):
    r = requests.get(self.archiver_url())
    if r.status_code == 200 and r.headers['content-type'] == 'application/json':
      self.archiver_json = r.text
      
  def name_without_whitespace(self):
    return ''.join(self.name.split())
    
  def tag_id(self):
    return "hp" + str(self.id)
    
  def __repr__(self):
    return "<HistoryPlot id: {0} report: {1}".format(self.id, self.report)