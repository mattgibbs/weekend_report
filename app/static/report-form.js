"use strict";
var Report = function() {
  this.programs = {};
  this.history_plots = {};
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
}

Report.prototype.setStartDate = function(startDate) {
  this.startDate = startDate;
};

Report.prototype.setEndDate = function(endDate) {
  this.endDate = endDate;
};

Report.prototype.addNewProgram = function() {
  var blankProgElem = $('div#blank-program > div.program-row');
  var newProgElem = blankProgElem.clone();
  var newProg = new Program(newProgElem);
  newProg.setid('new' + Date.now());
  this.programs[newProg.id] = newProg;
  $(newProgElem).appendTo('div#report_items');
  console.log(this)
};

Report.prototype.removeProgram = function(progid) {
  $(this.programs[progid].element).remove();
  delete this.programs[progid];
}

Report.prototype.addHistoryPlot = function(plot) {
  this.history_plots.push(plot);
};

Report.prototype.removeHistoryPlot = function(plotid) {
  $(this.history_plots[plotid].element).remove();
  delete this.history_plots[plotid];
}

Report.prototype.readFromElement = function(elem) {
  var report = this;
  $(elem).find('div#report_items').children().each(function(i, report_item) {
    if ($(report_item).hasClass('program-row')) {
      var program_to_add = new Program(report_item);
      program_to_add.readFromElement();
      if (program_to_add.id) {
        report.programs[program_to_add.id] = program_to_add;
      }
      
    } else if ($(report_item).hasClass('history-row')) {
      var history_plot_to_add = new HistoryPlot(report_item);
      history_plot_to_add.readFromElement();
      if (history_plot_to_add.id) {
        report.history_plots[history_plot_to_add.id] = history_plot_to_add;
      }
    }
  });
  var startDateParts = $(elem).find('input#start').val().split("/");
  this.startDate = new Date(startDateParts[2], (startDateParts[0] - 1), startDateParts[1],8);
  var endDateParts = $(elem).find('input#end').val().split("/");
  this.endDate = new Date(endDateParts[2], (endDateParts[0] - 1), endDateParts[1],8);
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
    if (note_to_add.id) {
      note_to_add.programid = prog.id;
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
  $(this.element).find('input').each(function(index) {
    var oldname = $(this).attr("name");
    if (oldname === "program") {
      $(this).attr("value", newid);
    } else if (oldname === "program-order-") {
      $(this).attr("name", oldname + newid).val(this.displayOrder);
    } else {
      $(this).attr("name", oldname + newid);
    }
  });
};

Program.prototype.setDowntimeData = function(data) {
  this.downtimeData = data;
};

Program.prototype.addNewNote = function() {
  var note_list = $(this.element).find('ul.notes-list');
  var new_note_element = note_list.children().last().clone();
  var newNote = new Note(new_note_element);
  newNote.programid = this.id;
  newNote.setid('new' + Date.now());
  newNote.setText('');
  this.notes.push(newNote);
  $(new_note_element).appendTo(note_list);
};

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

Note.prototype.readFromElement = function() {
  var elem = this.element;
  this.id = $(elem).find('input.note_id').val();
  this.text = $(elem).find('input.other_note').val();
};

var HistoryPlot = function(elem) {
  this.id = null;
  this.pv = null;
  this.events = [];
  this.displayOrder = null;
  this.element = elem
};

HistoryPlot.prototype.readFromElement = function(elem) {
  var elem = this.element;
  var plot = this;
  this.id = $(elem).data("plot-id");
  this.pv = $(elem).find('input.pv').val();
  this.displayOrder = parseInt($(elem).find('input.ordering-number').val(), 10);
  $(elem).find('div.add-event').each(function(i, event) {
    var newEvent = new HistoryEvent(event);
    newEvent.readFromElement();
    if (newEvent.id) {
      plot.events.push(newEvent);
    }
  });
};

HistoryPlot.prototype.setPV = function(pv) {
  this.pv = pv;
};

var HistoryEvent = function(elem) {
  this.id = null;
  this.text = null;
  this.timestamp = null;
  this.element = elem;
};

HistoryEvent.prototype.setText = function(text) {
  this.text = text;
};

HistoryEvent.prototype.setTimestamp = function(timestamp) {
  this.timestamp = timestamp;
};

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

DowntimeData.prototype.readFromElement = function() {
  var elem = this.element;
  this.downtime = parseFloat($(elem).find('input.downtime').val());
  this.configChanges = parseFloat($(elem).find('input.config_changes').val());
  this.delivered = parseFloat($(elem).find('input.delivered').val());
};

$( window ).load(function() {
  var report = new Report();
  report.readFromElement('form#report');
  console.log(report);
  
  $('a#add-program').on('click', function () {
    report.addNewProgram();
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
    console.log("AAA");
    var progid = $(this).parent().parent().data('prog-id');
    report.programs[progid].addNewNote();
    return false;
  });
  
});