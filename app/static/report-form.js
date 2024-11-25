"use strict";
var Report = function() {
  this.programs = {};
  this.history_plots = {};
  this.startDate = null;
  this.endDate = null;
  this.program_totals = {};
  this.dailyReports = [];
  this.element = null;
};

Report.prototype.items = function() {
  var allItems = [].concat(this.allPrograms()).concat(this.allPlots());
  allItems.sort(function(a,b) {
    return a.displayOrder - b.displayOrder;
  });
}

Report.prototype.allPrograms = function() {
  var allPrograms = [];
  for (var key in this.programs) {
    if (this.programs.hasOwnProperty(key)) {
      allPrograms.push(this.programs[key]);
    }
  }
  return allPrograms;
}

Report.prototype.allPlots = function() {
  var allPlots = [];
  for (var key in this.history_plots) {
    if (this.history_plots.hasOwnProperty(key)) {
      allPlots.push(this.history_plots[key]);
    }
  }
  return allPlots;
};

Report.prototype.displayOrderForNewItem = function() {
  var itemCount = this.allPrograms().length + this.allPlots().length;
  return itemCount + 1;
};

Report.prototype.redrawAllPlots = function() {
  for (var key in this.history_plots) {
    if (this.history_plots.hasOwnProperty(key)) {
      this.history_plots[key].plot();
    }
  }
};

Report.prototype.setStartDateString = function(startDate) {
  this.startDate = this.parseStartEndString(startDate);
  this.redrawAllPlots();
};

Report.prototype.setEndDateString = function(endDate) {
  this.endDate = this.parseStartEndString(endDate);
  this.redrawAllPlots();
};

Report.prototype.addNewProgram = function() {
  var blankProgElem = $('div#blank-program > div.program-row');
  var newProgElem = blankProgElem.clone();
  var newProg = new Program(newProgElem);
  newProg.displayOrder = this.displayOrderForNewItem();
  newProg.setid('new' + Date.now());
  this.programs[newProg.id] = newProg;
  $(newProgElem).appendTo('div#report_items');
};

Report.prototype.removeProgram = function(progid) {
  $(this.programs[progid].element).remove();
}

Report.prototype.addNewHistoryPlot = function(plot) {
  var blankPlotElem = $('div#blank-history-plot > div.history-row');
  var newPlotElem = blankPlotElem.clone();
  var newPlot = new HistoryPlot(this, newPlotElem);
  newPlot.displayOrder = this.displayOrderForNewItem();
  newPlot.setid('new' + Date.now());
  this.history_plots[newPlot.id] = newPlot;
  $(newPlot.element).find('div.add-event').each(function(i, event_element) {
    var newEvent = new HistoryEvent(newPlot, event_element);
    if ($(event_element).find('input.event-num').val() === "") {
      var new_event_id = "new" + Date.now();
      newEvent.setid(new_event_id);
    }
    newEvent.readFromElement();
    if (newEvent.id) {
      newPlot.events[newEvent.id] = newEvent;
    }
  });
  $(newPlotElem).appendTo('div#report_items');
  console.log(this.history_plots);
};

Report.prototype.removeHistoryPlot = function(plotid) {
  $(this.history_plots[plotid].element).remove();
  delete this.history_plots[plotid];
};

Report.prototype.parseStartEndString = function(datestring) {
  var dateParts = datestring.split("-");
  return new Date(dateParts[0], (dateParts[1] - 1), dateParts[2],8);
};

Report.prototype.makeDateString = function(date) {
  var pad = "00";
  var month = date.getMonth() + 1;
  var paddedMonth = (pad+month).slice(-pad.length);
  var day = date.getDate();
  var paddedDay = (pad+day).slice(-pad.length);
  return date.getFullYear() + "-" + paddedMonth + "-" + paddedDay;
}

Report.prototype.readFromElement = function(elem) {
  var report = this;
  this.element = elem;
  $(elem).find('div#report_items').children().each(function(i, report_item) {
    if ($(report_item).hasClass('program-row')) {
      var program_to_add = new Program(report_item);
      program_to_add.readFromElement();
      if (program_to_add.id) {
        report.programs[program_to_add.id] = program_to_add;
      }
      
    } else if ($(report_item).hasClass('history-row')) {
      var history_plot_to_add = new HistoryPlot(report, report_item);
      history_plot_to_add.readFromElement();
      if (history_plot_to_add.id) {
        report.history_plots[history_plot_to_add.id] = history_plot_to_add;
      }
    }
  });
  this.startDate = this.parseStartEndString($(elem).find('input#start').val());
  this.endDate = this.parseStartEndString($(elem).find('input#end').val());
};

Report.prototype.datesValid = function() {
  if (isNaN(this.startDate) || isNaN(this.endDate)) {
    return false;
  }
  return true;
};

Report.prototype.useDefaultStartDate = function() {
  var defaultStart = new Date();
  
  //Go back in time until we get to a Friday.
  //Date.getDay() returns 0 for Sunday, 6 for Saturday.
  while (defaultStart.getDay() !== 5) {
    //Subtract one day.
    defaultStart -= 1000 * 60 * 60 * 24;
    defaultStart = new Date(defaultStart);
  }
  defaultStart.setHours(8);
  defaultStart.setMinutes(0);
  defaultStart.setSeconds(0);
  var this_report = this;
  this.startDate = defaultStart;
  $(this.element).find('input#start').val(this_report.makeDateString(defaultStart));
}

Report.prototype.useDefaultEndDate = function() {
  var defaultEnd = new Date();
  while (defaultEnd.getDay() !== 0) {
    defaultEnd -= 1000 * 60 * 60 * 24;
    defaultEnd = new Date(defaultEnd);
  }
  defaultEnd.setHours(8);
  defaultEnd.setMinutes(0);
  defaultEnd.setSeconds(0);
  var this_report = this;
  this.endDate = defaultEnd;
  $(this.element).find('input#end').val(this_report.makeDateString(defaultEnd));
}

Report.prototype.importDailyReports = function() {
  var this_report = this;
  var startDate = this.startDate
  var endDate = this.endDate
  //Get all the daily reports that fall within our weekend report range.
  console.log("https://mccelog.slac.stanford.edu/elog/dev/mgibbs/mcc_shift_sum/json_report.php?start_date=" + startDate.toISOString() + "&end_date=" + endDate.toISOString());
  $.ajax({
    dataType: "json",
    url: "https://mccelog.slac.stanford.edu/elog/dev/mgibbs/mcc_shift_sum/json_report.php?start_date=" + startDate.toISOString() + "&end_date=" + endDate.toISOString()
  }).done(function( data ) {
    this_report.dailyReports = data;
    //Calculate time accounting totals for each program reported in the daily reports.
    this_report.program_totals = {};
    var programs = []; //This is just an array of the keys used to access the data in program_totals.
    this_report.dailyReports.forEach(function(report) {
      report['shifts'].forEach(function(shift) {
        if (shift['programs']) {
          shift['programs'].forEach(function(program) {
            if (this_report.program_totals[program['name']] == undefined) {
              programs.push(program['name']);
              this_report.program_totals[program['name']] = {"delivered": 0, "user_off": 0, "tuning": 0, "config_changes": 0, "down": 0, "off": 0};
            }
            this_report.program_totals[program['name']]['delivered'] += parseFloat(program['delivered']);
            this_report.program_totals[program['name']]['user_off'] += parseFloat(program['user_off']);
            this_report.program_totals[program['name']]['tuning'] += parseFloat(program['tuning']);
            this_report.program_totals[program['name']]['config_changes'] += parseFloat(program['config_changes']);
            this_report.program_totals[program['name']]['down'] += parseFloat(program['down']);
            this_report.program_totals[program['name']]['off'] += parseFloat(program['off']);
          });
        }
      });
    });
  
    //Now that we have all the report totals, we can populate the <option> fields for the import program select fields.
    programs.forEach(function(program) {
      $('select.imported-programs').append('<option value="' + program + '">' + program + '</option>');
    });
  
    $('span.import-downtime').show();
    console.log(this_report.program_totals);
    console.log(this_report.dailyReports);
  });
};

var Program = function(elem) {
  this.id = null;
  this.name = null;
  this.time_note = null;
  this.config_note = null;
  this.performance_note = null;
  this.notes = [];
  this.downtimeData = null;
  this.displayOrder = null;
  this.element = elem;
};

Program.prototype.readFromElement = function() {
  var elem = this.element;
  var prog = this;
  this.id = $(elem).data("prog-id");
  this.name = $(elem).find('input.name').val();
  this.time_note = $(elem).find('input.time_note').val();
  this.config_note = $(elem).find('input.config_note').val();
  this.performance_note = $(elem).find('input.performance_note').val();
  this.displayOrder = parseInt($(elem).find('input.ordering-number').val(), 10);
  $(elem).find('li.other_note').each(function(i, note) {
    var note_to_add = new Note(this);
    note_to_add.readFromElement();
    note_to_add.setProgramid(prog.id);
    if (note_to_add.id) {
      prog.notes.push(note_to_add);
    }
  });
  var downtime = new DowntimeData($(elem).find('div.downtime-inputs'));
  downtime.readFromElement();
  this.downtimeData = downtime;
};

Program.prototype.setid = function(newid) {
  this.id = newid;
  $(this.element).attr('data-prog-id', newid);
  $(this.element).find('input.program-id').attr("value", newid);
  $(this.element).find('input.ordering-number').attr("name", "program-order-" + newid).val(this.displayOrder);
  $(this.element).find('input.name').attr("name", "name-" + newid);
  $(this.element).find('input.time_note').attr("name", "time_note-" + newid);
  $(this.element).find('input.config_note').attr("name", "config_note-" + newid);
  $(this.element).find('input.performance_note').attr("name", "performance_note-" + newid);
  //The stuff we do to the note inputs (next three lines) is only correct if this is a new program.  Luckily that is the only time setid is called.
  var new_note_id = "new" + Date.now();
  $(this.element).find('input.note_id').attr("value", new_note_id);
  $(this.element).find('input.note_id').attr("name", "program[" + newid + "]note");
  $(this.element).find('input.other_note').attr("name", "program[" + newid + "]note[" + new_note_id +"]-text");
  $(this.element).find('input.downtime').attr("name", "downtime-" + newid);
  $(this.element).find('input.config_changes').attr("name", "config_changes-" + newid);
  $(this.element).find('input.delivered').attr("name", "delivered-" + newid);
  $(this.element).find('input.tuning').attr("name", "tuning-" + newid);
  $(this.element).find('input.user_off').attr("name", "user_off-" + newid);
  $(this.element).find('input.off').attr("name", "off-" + newid);
};

Program.prototype.setDowntimeData = function(data) {
  this.downtimeData = data;
};

Program.prototype.addNewNote = function() {
  var note_list = $(this.element).find('ul.notes-list');
  var new_note_element = $('div#blank-program > div.program-row').find('ul.notes-list').children().last().clone();
  var newNote = new Note(new_note_element);
  newNote.setProgramid(this.id);
  newNote.setid('new' + Date.now());
  newNote.setText('');
  this.notes.push(newNote);
  $(new_note_element).appendTo(note_list);
};

Program.prototype.removeNote = function(noteid) {
  var note_index = -1;
  this.notes.forEach(function(note, i) {
    if (note.id === noteid) {
      $(note.element).remove();
      note_index = i;
    }
  });
  if (note_index > -1) {
    this.notes.splice(note_index, 1);
  }
}

var Note = function(elem) {
  this.id = null;
  this.programid = null;
  this.text = null;
  this.element = elem;
};

Note.prototype.setText = function(text) {
  this.text = text;
  $(this.element).find('input.other_note').val(this.text);
};

Note.prototype.setid = function(newid) {
  this.id = newid;
  $(this.element).find('input.note_id').val(this.id);
  $(this.element).find('input.other_note').attr("name", "program[" + this.programid + "]note[" + this.id + "]-text");
};

Note.prototype.setProgramid = function(progid) {
  this.programid = progid;
  $(this.element).find('input.note_id').attr("name", "program[" + progid + "]note");
}

Note.prototype.readFromElement = function() {
  var elem = this.element;
  this.id = $(elem).find('input.note_id').val();
  this.text = $(elem).find('input.other_note').val();
};

var HistoryPlot = function(report, elem) {
  this.id = null;
  this.pv = null;
  this.title = null;
  this.report = report;
  this.plotData = null;
  this.events = {};
  this.displayOrder = null;
  this.element = elem
};

HistoryPlot.prototype.readFromElement = function(elem) {
  var elem = this.element;
  var plot = this;
  this.id = $(elem).data("plot-id");
  this.pv = $(elem).find('input.pv').val();
  this.title = $(elem).find('input.plot-title').val();
  this.displayOrder = parseInt($(elem).find('input.ordering-number').val(), 10);
  $(elem).find('div.add-event').each(function(i, event_element) {
    var newEvent = new HistoryEvent(plot, event_element);
    if ($(event_element).find('input.event-num').val() === "") {
      var new_event_id = "new" + Date.now();
      newEvent.setid(new_event_id);
    }
    newEvent.readFromElement();
    if (newEvent.id) {
      plot.events[newEvent.id] = newEvent;
    }
  });
};

HistoryPlot.prototype.addNewEvent = function() {
  var blankEvent = $('div#blank-history-plot > div.history-row').find('div.add-event').clone();
  var newEventID = 'new' + Date.now();
  var newEvent = new HistoryEvent(this, blankEvent);
  newEvent.setid(newEventID);
  this.events[newEvent.id] = newEvent;
  $(newEvent.element).appendTo($(this.element).find('div.events'));
};

HistoryPlot.prototype.removeEvent = function(eventid) {
  $(this.events[eventid].element).remove();
  delete this.events[eventid];
  this.refreshMarkers();
};

HistoryPlot.prototype.plotMarkers = function() {
  var allEvents = [];
  for (var key in this.events) {
    if (this.events.hasOwnProperty(key)) {
      allEvents.push(this.events[key]);
    }
  }
  
  var markers = allEvents.map(function(event) {
    return { label: event.text, date: event.timestamp };
  });
  return markers;
}

HistoryPlot.prototype.setid = function(newid) {
  this.id = newid;
  $(this.element).attr('data-plot-id', newid);
  $(this.element).find('input.plot-number').val(newid);
  $(this.element).find('input.ordering-number').attr('name', 'plot-order-' + newid).val(this.displayOrder);
  $(this.element).find('input.plot-title').attr('name', 'plot-title-' + newid);
  $(this.element).find('input.pv').attr('name', 'pv-' + newid);
  var new_event_id = 'new' + Date.now();
  $(this.element).find('div.add-event').attr('data-plot-id', newid).attr('data-event-id', new_event_id);
  $(this.element).find('input.event-num').attr('name', 'plot[' + newid + ']event').val(new_event_id);
  $(this.element).find('input.event-text').attr('name', 'plot[' + newid + ']event[' + new_event_id + ']-text');
  $(this.element).find('input.event-timestamp').attr('name', 'plot[' + newid + ']event[' + new_event_id + ']-timestamp');
  $(this.element).find('a.remove-event').attr('data-plot-id', newid).attr('data-event-id', new_event_id);
  $(this.element).find('a.add-event').attr('data-plot-id', newid);
  $(this.element).find('div.history-plot').attr('id', 'history-' + newid);
};

HistoryPlot.prototype.setPV = function(pv) {
  this.pv = pv;
};

HistoryPlot.prototype.setTitle = function(title) {
  this.title = title;
  this.refreshMarkers();
};

HistoryPlot.prototype.plot = function() {
  var this_plot = this;
  if (this.element === null || this.pv === null || this.report.startDate == null || 
      this.report.endDate == null || isNaN(this.report.startDate.getTime()) || isNaN(this.report.endDate.getTime())) {
    return false;
  }
  var archiver_url = 'http://lcls-archapp.slac.stanford.edu/retrieval/data/getData.json?pv=mean_360(' + this.pv + ')' +
                      '&from='+this.report.startDate.toISOString()+
                      '&to='+this.report.endDate.toISOString();
  
  d3.json(archiver_url, function(data) {
    var time_series = data[0].data.map(function(item) {
      return {"date": new Date(item.secs * 1000), "val": item.val};
    });
    this_plot.plotData = MG.data_graphic({
      title: this_plot.title || this_plot.pv,
      data: time_series,
      markers: this_plot.plotMarkers(),
      width: 800,
      full_width: true,
      height: 260,
      target: '#history-' + this_plot.id,
      x_accessor: 'date',
      y_accessor: 'val',
      min_x: time_series[0].date,
      min_y: 0,
      area: true
    });
    $(this_plot.element).find('div.event-container').show();
  });
};

HistoryPlot.prototype.refreshMarkers = function() {
  //If we don't have the plot data stored (happens if this was an existing plot, rendered in the template), we need to get it.
  if (this.plotData === null) {
    this.plot();
    return;
  }
  var this_plot = this;
  MG.data_graphic({
    title: this_plot.title || this_plot.pv,
    data: this_plot.plotData,
    markers: this_plot.plotMarkers(),
    width: 800,
    full_width: true,
    height: 260,
    target: '#history-' + this_plot.id,
    x_accessor: 'date',
    y_accessor: 'val',
    min_x: this_plot.plotData[0].date,
    min_y: 0,
    area: true
  });
};

var HistoryEvent = function(plot, elem) {
  this.id = null;
  this.plot = plot;
  this.text = null;
  this.timestamp = null;
  this.element = elem;
};

HistoryEvent.prototype.setid = function(newid) {
  this.id = newid;
  $(this.element).attr("data-event-id", newid);
  $(this.element).attr("data-plot-id", this.plot.id);
  $(this.element).find('a.remove-event').attr("data-plot-id", this.plot.id);
  $(this.element).find('a.remove-event').attr("data-event-id", newid);
  $(this.element).find('input.event-num').attr("name", "plot[" + this.plot.id + "]event").val(newid);
  $(this.element).find('input.event-text').attr("name", "plot[" + this.plot.id + "]event[" + newid + "]-text");
  $(this.element).find('input.event-timestamp').attr("name", "plot[" + this.plot.id + "]event[" + newid + "]-timestamp");
}

HistoryEvent.prototype.setText = function(text) {
  this.text = text;
  this.plot.refreshMarkers();
};

HistoryEvent.prototype.setTimestamp = function(timestamp) {
  this.timestamp = timestamp;
  this.plot.refreshMarkers();
};

HistoryEvent.prototype.setTimestampString = function(timestring) {
  var timestamp = Date.parse(timestring);
  this.setTimestamp(timestamp);
}

HistoryEvent.prototype.readFromElement = function() {
  var elem = this.element;
  this.id = $(elem).find('input.event-num').val();
  this.text = $(elem).find('input.event-text').val();
  this.timestamp = Date.parse($(elem).find('input.event-timestamp').val());
};

var DowntimeData = function(elem) {
  this.downtime = 0.0;
  this.configChanges = 0.0;
  this.delivered = 0.0;
  this.tuning = 0.0;
  this.user_off = 0.0;
  this.off = 0.0;
  this.element = elem;
};

DowntimeData.prototype.setDowntime = function(downtime) {
  this.downtime = downtime;
};

DowntimeData.prototype.setConfigChanges = function(configChanges) {
  this.configChanges = configChanges;
};

DowntimeData.prototype.setDelivered = function(delivered) {
  this.delivered = delivered;
};

DowntimeData.prototype.setTuning = function(tuning) {
  this.tuning = tuning;
}

DowntimeData.prototype.setUserOff = function(user_off) {
  this.user_off = user_off;
}

DowntimeData.prototype.setOff = function(off) {
  this.off = off;
}

DowntimeData.prototype.readFromElement = function() {
  var elem = this.element;
  this.downtime = parseFloat($(elem).find('input.downtime').val());
  this.configChanges = parseFloat($(elem).find('input.config_changes').val());
  this.delivered = parseFloat($(elem).find('input.delivered').val());
  this.tuning = parseFloat($(elem).find('input.tuning').val());
  this.user_off = parseFloat($(elem).find('input.user_off').val());
  this.off = parseFloat($(elem).find('input.off').val());
};

$( window ).load(function() {
  var report = new Report();
  report.readFromElement('form#report');
  
  if (!report.datesValid()) {
    report.useDefaultStartDate();
    report.useDefaultEndDate();
  }
  
  $('a#add-program').on('click', function () {
    report.addNewProgram();
    return false;
  });
  
  $('a#add-history-plot').on('click', function() {
    report.addNewHistoryPlot();
    return false;
  });
  
  $('div#report_items').on('click', 'a.remove-program', function() {
    var progid = $(this).parent().parent().data('prog-id');
    report.removeProgram(progid);
    return false;
  });
  
  $('div#report_items').on('click', 'a.remove-plot', function() {
    var plotid = $(this).parent().parent().data('plot-id');
    report.removeHistoryPlot(plotid);
    return false;
  });
  
  $('div#report_items').on('click', 'a.add-note', function() {
    var progid = $(this).parent().parent().data('prog-id');
    report.programs[progid].addNewNote();
    return false;
  });
  
  $('div#report_items').on('click', 'a.remove-note', function() {
    var progid = $(this).parent().parent().parent().parent().data('prog-id');
    var noteid = $(this).prev().prev().val();
    report.programs[progid].removeNote(noteid);
    return false;
  });
  
  $('div#report_items').on('click', 'a.plot-pv', function() {
    var plotid = $(this).parent().parent().data('plot-id');
    var pv = $(this).prev().val();
    var plot = report.history_plots[plotid];
    plot.pv = pv;
    plot.plot();
    return false;
  });
  
  $('div#report_items').on('click', 'a.add-event', function() {
    var plotid = $(this).data('plot-id');
    report.history_plots[plotid].addNewEvent();
    return false;
  });
  
  $('div#report_items').on('click', 'a.remove-event', function() {
    var plotid = $(this).data('plot-id');
    var eventid = $(this).data('event-id');
    report.history_plots[plotid].removeEvent(eventid);
    return false;
  });
  
  $('div#report_items').on('change', 'input.event-text', function() {
    var plotid = $(this).parent().data('plot-id');
    var eventid = $(this).parent().data('event-id');
    report.history_plots[plotid].events[eventid].setText($(this).val());
  });
  
  $('div#report_items').on('change', 'input.event-timestamp', function() {
    var plotid = $(this).parent().data('plot-id');
    var eventid = $(this).parent().data('event-id');
    report.history_plots[plotid].events[eventid].setTimestampString($(this).val());
  });
  
  $('div#report_items').on('change', 'input.plot-title', function() {
    var plotid = $(this).parent().parent().parent().data('plot-id');
    report.history_plots[plotid].setTitle($(this).val());
  });
  
  $("div#report_items").on('change', 'select.imported-programs', function(){
    var selected_program = $(this).val();
    var totals = report.program_totals[selected_program];
    if (totals === undefined) {
      return;
    }
    $(this).parent().parent().find('input.downtime').val(totals['down'].toFixed(1));
    $(this).parent().parent().find('input.config_changes').val(totals['config_changes'].toFixed(1));
    $(this).parent().parent().find('input.delivered').val(totals['delivered'].toFixed(1));
    $(this).parent().parent().find('input.tuning').val(totals['tuning'].toFixed(1));
    $(this).parent().parent().find('input.user_off').val(totals['user_off'].toFixed(1));
    $(this).parent().parent().find('input.off').val(totals['off'].toFixed(1));
  });
  
  $('input#start').on('change', function() {
    report.setStartDateString($(this).val());
  });
  
  $('input#end').on('change', function() {
    report.setEndDateString($(this).val());
  });
  
  $('a#begin').on('click', function() {
    if (report.datesValid()) {
      $(this).hide();
      $('div.add').show();
      report.importDailyReports();
    } else {
      alert("Enter valid dates to begin.");
    }
  });
  
  $("a#submit-report").on('click', function() {
    var saved_form = $('form#report').serialize();
    localStorage.setItem('temp_form', JSON.stringify(saved_form));
    $('form#report').submit();
  });
  
});
