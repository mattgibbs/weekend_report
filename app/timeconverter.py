from app import app
import pytz
from datetime import datetime
local = pytz.timezone(app.config['LOCAL_TIMEZONE'])

def convert_to_UTC(naive_datetime):
  local_datetime = local.localize(naive_datetime, is_dst=None)
  utc_datetime = local_datetime.astimezone(pytz.utc)
  return utc_datetime.replace(tzinfo=None)