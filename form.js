/* form.js - adds interactivity to the weekend report form, so you can click on an element to edit it */

$( window ).load(function() {
  $('a#add-program').on('click', function() {
    $(this).parent().before('<th><input placeholder="Program"></th>')
    $('tr.times').append('<td><input value=""></td>');
    $('tr.configurations').append('<td><textarea rows="2" placeholder="Configuration"></textarea></td>');
    $('tr.performance').append('<td><textarea rows="2" placeholder="Performance Notes"></textarea></td>');
    $('tr.uptime').append('<td><ul class="list-unstyled"><li><input value="" placeholder="Downtime"> hours</li><li><input value="" placeholder="Config Changes"> hours</li><li><input value="" placeholder="Delivered"> hours</li></ul></td>');
    $('tr.downtime-events').append('<td><ul class="list-unstyled"><li><textarea rows="4"></textarea></li><li><a href="#" class="new-event btn btn-default">Add another event</a></li></ul></td>');
  });
  
  $('a.new-event').on('click', function() {
    $(this).parent().before('<li><textarea rows="4"></textarea></li>');
  });
});