/* form.js - adds interactivity to the weekend report form */
$( window ).load(function() {
  var program_number = 0;
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
});