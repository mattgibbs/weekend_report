/* form.js - adds interactivity to the weekend report form, so you can click on an element to edit it */

$( window ).load(function() {
  $('button#add-program').on('click', function() {
    //var next_program = $(this).parent().prev().data("program") + 1;
    //console.log("Adding program " + next_program);
    //$(this).parent().prev().clone().insertBefore($(this).parent());
    //$(this).parent().prev().data("program", next_program);
    //console.log("Added program " + $(this).parent().prev().data("program"));
    //$(this).parent().before('<th><input placeholder="Program"></th>').data("program",next_program);
    var last_prog_selector = $('tr.program-names th.choose-program').last();
    var next_program = last_prog_selector.data("program") + 1;
    var new_prog_selector = last_prog_selector.clone().data("program", next_program).insertAfter(last_prog_selector);
    
    var last_time_note = $('tr.times td').last();
    var new_time_note = last_time_note.clone().data("program", next_program).insertAfter(last_time_note);
    new_time_note.find('input').val("");
    
    
    var last_config_note = $('tr.configurations td').last();
    var new_config_note = last_config_note.clone().data("program", next_program).insertAfter(last_config_note);
    new_config_note.find('textarea').text("");
    
    var last_perf_note = $('tr.performance td').last();
    var new_perf_note = last_perf_note.clone().data("program", next_program).insertAfter(last_perf_note);
    new_perf_note.find('textarea').text("");
    
    var last_uptime_note = $('tr.uptime td').last();
    var new_uptime_note = last_uptime_note.clone().data("program", next_program).insertAfter(last_uptime_note);
    new_uptime_note.find('input').val("");
    
    $('tr.downtime-events').append('<td><ul class="list-unstyled"><li><textarea rows="4"></textarea></li><li><button class="new-event btn btn-default">Add another event</button></li></ul></td>');
    $('tr.downtime-events td').last().data("program", next_program);
    
    var last_delete_button = $('tr.delete-buttons td').last();
    var new_delete_button = last_delete_button.clone().data("program", next_program).insertAfter(last_delete_button);
    new_delete_button.find('button').data("program", next_program);
    new_delete_button.find('button').removeClass("disabled");
  });
  
  $('tr.delete-buttons').on('click', 'button.remove-program', function(){
    var program_to_delete = $(this).data("program");
    console.log("Going to delete " + program_to_delete);
    //$('td[data-program="' + program_to_delete + '"], th[data-program="' + program_to_delete + '"]').remove();
    $('td, th').filter(function() {
      if (program_to_delete === 0) {
        return false;
      }
      return $(this).data("program") === program_to_delete;
    }).remove();
  });
  
  $('tr.delete-buttons').on('mouseenter', 'button.remove-program', function(){
    var program_to_highlight = $(this).data("program");
    $('td, th').filter(function() {
      return $(this).data("program") === program_to_highlight;
    }).css("background-color", "#FFB0B0");
  });
  
  $('tr.delete-buttons').on('mouseleave', 'button.remove-program', function(){
    var program_to_highlight = $(this).data("program");
    $('td, th').filter(function() {
      return $(this).data("program") === program_to_highlight;
    }).css("background-color", "");
  });
  
  $('tr.downtime-events').on('click', 'button.new-event', function(){
    var program = $(this).data("program");
    console.log("Adding a comment for " + program);
    $(this).parent().before('<li><textarea rows="4"></textarea></li>');
  });
});