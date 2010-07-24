function toggleStatusMessage(message) {
  if (message) {
    $('#infomessage').text(message);
  }

  $('#infobox').slideToggle('slow');
};
