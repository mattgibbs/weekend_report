/* form.js - adds interactivity to the weekend report form */
$( window ).load(function() {
  //Program stuff
  var program_number = 0;
  
  function addNewProgram() {
    var last_prog = $('div#program-list > div.program-row').last();
    var blank_prog = $('div#blank-program > div.program-row');
    var new_prog = blank_prog.clone().appendTo('div#program-list');
    new_prog.find('input').each(function(index) {
      var oldname = $(this).attr("name");
      if (oldname === "program") {
        $(this).attr("value", program_number);
      } else {
        $(this).attr("name", oldname + program_number);
      }
    });
    program_number += 1;
  }
  addNewProgram();
  
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
    var history_plot_number = $(this).parent().parent().children('input.plot-number').val();
    var text = $(this).prev().prev().val();
    var timestamp = Date.parse($(this).prev().val());
    history_plots[history_plot_number]["events"].push({ 'date': timestamp, 'label': text });
    MG.data_graphic({
      title: history_plots[history_plot_number]["PV"],
      data: history_plots[history_plot_number]["plot_data"],
      markers: history_plots[history_plot_number]["events"],
      width: 800,
      full_width: true,
      height: 260,
      target: '#history-' + history_plot_number,
      x_accessor: 'date',
      y_accessor: 'val',
      min_x: history_plots[history_plot_number]["plot_data"][0].date,
      min_y: 0,
      area: true
    });
    return false;
  });
  
});