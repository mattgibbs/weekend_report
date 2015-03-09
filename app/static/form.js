/* form.js - adds interactivity to the weekend report form */
$( window ).load(function() {
  
  //Program stuff
  var program_number = 0;
  var ordering_number = 0;
  
  function addNewProgram() {
    var last_prog = $('div#program-list > div.program-row').last();
    var blank_prog = $('div#blank-program > div.program-row');
    var new_prog = blank_prog.clone().appendTo('div#program-list');
    new_prog.find('input').each(function(index) {
      var oldname = $(this).attr("name");
      if (oldname === "program") {
        $(this).attr("value", program_number);
      } else if (oldname === "program-order-") {
        $(this).attr("name", oldname + program_number).val(ordering_number);
        ordering_number = ordering_number + 1;
      } else {
        $(this).attr("name", oldname + program_number);
      }
    });
    program_number += 1;
  }
  
  var dailyReports = [];
  var program_totals = {};
  function importDailyReports() {
    console.log("Importing reports!");
    var startDate = new Date($('input#start').val());
    var endDate = new Date($('input#end').val());
    startDate.setDate(startDate.getDate() + 1);
    endDate.setDate(endDate.getDate() + 1);
    //Get all the daily reports that fall within our weekend report range.
    console.log("https://mccelog.slac.stanford.edu/elog/dev/mgibbs/mcc_shift_sum/json_report.php?start_date=" + startDate.toISOString() + "&end_date=" + endDate.toISOString());
    $.ajax({
      url: "https://mccelog.slac.stanford.edu/elog/dev/mgibbs/mcc_shift_sum/json_report.php?start_date=" + startDate.toISOString() + "&end_date=" + endDate.toISOString()
    }).done(function( data ) {
      dailyReports = data;
      //Calculate time accounting totals for each program reported in the daily reports.
      program_totals = {};
      var programs = []; //This is just an array of the keys used to access the data in program_totals.
      dailyReports.forEach(function(report) {
        report['shifts'].forEach(function(shift) {
          shift['programs'].forEach(function(program) {
            if (program_totals[program['name']] == undefined) {
              programs.push(program['name']);
              program_totals[program['name']] = {"delivered": 0, "user_off": 0, "tuning": 0, "config_changes": 0, "down": 0, "off": 0};
            }
            program_totals[program['name']]['delivered'] += parseFloat(program['delivered']);
            program_totals[program['name']]['user_off'] += parseFloat(program['user_off']);
            program_totals[program['name']]['tuning'] += parseFloat(program['tuning']);
            program_totals[program['name']]['config_changes'] += parseFloat(program['config_changes']);
            program_totals[program['name']]['down'] += parseFloat(program['down']);
            program_totals[program['name']]['off'] += parseFloat(program['off']);
          });
        });
      });
      
      //Now that we have all the report totals, we can populate the <option> fields for the import program select fields.
      programs.forEach(function(program) {
        $('select.imported-programs').append('<option value="' + program + '">' + program + '</option>');
      });
      
      $('span.import-downtime').show();
      console.log(program_totals);
      console.log(dailyReports);
    });
  }
  
  $("div#program-list").on('change', 'select.imported-programs', function(){
    var selected_program = $(this).val();
    var totals = program_totals[selected_program];
    if (totals === undefined) {
      return;
    }
    $(this).parent().parent().find('input.downtime').val(totals['down'].toFixed(1));
    $(this).parent().parent().find('input.config_changes').val(totals['config_changes'].toFixed(1));
    $(this).parent().parent().find('input.delivered').val(totals['delivered'].toFixed(1));
  });
  
  function datesFilled() {
    if ($("input#start").val() == "" && $("input#end").val() == "") {
      return false;
    }
    var startDate = new Date($('input#start').val());
    var endDate = new Date($('input#end').val());
    if (isNaN(startDate) || isNaN(endDate)) {
      return false;
    }
    return true;
  }
  
  $("a#begin").on('click', function() {
    if (datesFilled()) {
      addNewProgram();
      importDailyReports();
      $(this).hide();
      $('div.add').show();
    } else {
      alert("Dates not valid.");
    }
    return false;
  });
  
  $("a#add-program").on('click', function() {
    addNewProgram();
    return false;
  });
  
  $("div#program-list").on('click', 'a.add-note', function() {
    var last_note_selector = $(this).prev().children().last();
    var new_note_selector = last_note_selector.clone().insertAfter(last_note_selector).find('input').val("");
    return false;
  });
  
  $("div#program-list").on('click', 'a.remove-program', function() {
    var program_to_delete = $(this).parent().parent();
    $(program_to_delete).remove();
    return false;
  });
  
  $("a#save-report").on('click', function() {
    $('form#report').submit();
  });
  
  //History Plot stuff
  var plot_number = 0;
  var history_plots = {};
  function addNewHistoryPlot() {
    var last_plot = $('div#program-list > div.history-row').last();
    var blank_plot = $('div#blank-history-plot > div.history-row');
    var new_plot = blank_plot.clone().appendTo('div#program-list');
    new_plot.find('input').each(function(index) {
      var oldname = $(this).attr("name");
      if (oldname === "history_plot") {
        $(this).attr("value", plot_number);
      } else if (oldname === "plot[]event[]-text") {
        $(this).attr("name", "plot[" + plot_number + "]event[0]-text");
        $(this).parent().attr('data-event-num',0);
      } else if (oldname === "plot[]event[]-timestamp") {
        $(this).attr("name", "plot[" + plot_number + "]event[0]-timestamp");
      } else if (oldname === "plot[]event") {
        $(this).attr("name", "plot[" + plot_number +"]event").val(plot_number);
      } else if (oldname === "plot-order-") {
        $(this).attr("name", oldname + plot_number).val(ordering_number);
        ordering_number = ordering_number + 1;
      } else {
        $(this).attr("name", oldname + plot_number);
      }
    });
    new_plot.find('div.history-plot').attr("id", "history-" + plot_number);
    plot_number += 1;
  }
  
  $("a#add-history-plot").on('click', function() {
    addNewHistoryPlot();
    return false;
  });
  
  $("div#program-list").on('click', 'a.plot-pv', function() {
    var plot_pv_link = this;
    var PV = $(this).prev().val();
    if (PV == "" || $('input#start').val() == "" || $('input#end').val() == "") {
      return false;
    }
    
    var history_plot_number = $(this).parent().children('input.plot-number').val();
    history_plots[history_plot_number] = {};
    history_plots[history_plot_number]["PV"] = PV;
    var dateRange = [$('input#start').val().split("/"), $('input#end').val().split("/")].map(function(dateParts) {
      return new Date(dateParts[2], (dateParts[0] - 1), dateParts[1],8);
    });
    var archiver_url = 'http://lcls-archapp.slac.stanford.edu/retrieval/data/getData.json?pv=mean_360(' + PV + ')' +
                        '&from='+dateRange[0].toISOString()+
                        '&to='+dateRange[1].toISOString();
    
    d3.json(archiver_url, function(data) {
      var time_series = data[0].data.map(function(item) {
        return {"date": new Date(item.secs * 1000), "val": item.val};
      });
      history_plots[history_plot_number]["events"] = [];
      history_plots[history_plot_number]["plot_data"] = MG.data_graphic({
        title: PV,
        data: time_series,
        markers: [],
        width: 800,
        full_width: true,
        height: 260,
        target: '#history-' + history_plot_number,
        x_accessor: 'date',
        y_accessor: 'val',
        min_x: time_series[0].date,
        min_y: 0,
        area: true
      });
      //Show the 'add event' stuff.
      $(plot_pv_link).next().show();
    });
    return false;
  });
  
  $("div#program-list").on('click', 'a.add-event', function() {
    //Add a marker to the plot
    var history_plot_number = $(this).parent().parent().children('input.plot-number').val();
    var event_num = parseInt($(this).parent().data("event-num"),10);

    //Add another event entry row.
    var new_event_num = event_num + 1;
    var add_event_fields = $(this).parent().clone();
    $(add_event_fields).attr('data-event-num', new_event_num);
    $(add_event_fields).children('input.event-num').attr("name", "plot[" + history_plot_number + "]event").val(new_event_num);
    $(add_event_fields).children('input.event-text').attr("name", "plot[" + history_plot_number + "]event[" + new_event_num + "]-text").val("");
    $(add_event_fields).children('input.event-timestamp').attr("name", "plot[" + history_plot_number + "]event[" + new_event_num + "]-timestamp").val("");
    $(add_event_fields).insertAfter($(this).parent());
    return false;
  });
  
  $("div#program-list").on('change', 'input.event-text, input.event-timestamp', function() {    
    var history_plot_number = $(this).parent().parent().children('input.plot-number').val();
    var event_number = parseInt($(this).parent().data('event-num'),10);
    
    if (history_plots[history_plot_number]["events"][event_number] === undefined) {
      var text = $(this).parent().children('input.event-text').val();
      var timestamp = Date.parse($(this).parent().children('input.event-timestamp').val());
      if (isNaN(timestamp)) {
        return;
      }
      if (text == "") {
        return;
      }
      history_plots[history_plot_number]["events"][event_number] = { 'date': timestamp, 'label': text };
      updateHistoryPlot(history_plot_number);
      return;
    }
    
    if ($(this).hasClass('event-text')) {
      var text = $(this).val();
      history_plots[history_plot_number]["events"][event_number]['label'] = text;
    } else if ($(this).hasClass('event-timestamp')) {
      var timestamp = Date.parse($(this).val());
      history_plots[history_plot_number]["events"][event_number]['date'] = timestamp;
    }
    
    updateHistoryPlot(history_plot_number);
  });
  
  function updateHistoryPlot(plotNum) {
    MG.data_graphic({
      title: history_plots[plotNum]["PV"],
      data: history_plots[plotNum]["plot_data"],
      markers: history_plots[plotNum]["events"],
      width: 800,
      full_width: true,
      height: 260,
      target: '#history-' + plotNum,
      x_accessor: 'date',
      y_accessor: 'val',
      min_x: history_plots[plotNum]["plot_data"][0].date,
      min_y: 0,
      area: true
    });
  }
});