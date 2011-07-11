$(document).ready(function() {
  var theCli = new ApigeeCli();
  function checkLocalStorage() {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
      return false;
    }
  }
  var doesLocalStorage = checkLocalStorage();
  var inputHistory = (doesLocalStorage && localStorage.inputHistory) ? $.parseJSON(localStorage.inputHistory) : {maxLength:42,currentPosition:0,historyCommands:[]}; //we have the answer, if only we knew the question
  $('#cli_input').focus();
  $('#cli_holder').submit(function() {return false;});
  $('#cli_input').keydown(function(event) {
    event.stopPropagation();
    if (event.keyCode == '13') {
      event.preventDefault();
      $('#cli_transcript').append('<li class="request">'+this.value+'</li>');
      theCli.doCommand(this.value);
      setInputHistory(this.value);
      this.value = '';
      setTranscriptClick();
    } else if (event.which == '38') {
      var newValue = "";
      if (inputHistory.currentPosition > 0) {
        var newPosition = (inputHistory.currentPosition - 1);
        newValue = inputHistory.historyCommands[newPosition];
        inputHistory.currentPosition = newPosition;
      }
      setInputValue(newValue);
    } else if (event.which == '40') {
      var newValue = "";
      if (inputHistory.currentPosition < (inputHistory.historyCommands.length - 1)) {
        var newPosition = (inputHistory.currentPosition + 1);
        newValue = inputHistory.historyCommands[newPosition];
        inputHistory.currentPosition = newPosition;
      }
      setInputValue(newValue);
    }
  });
  var setTranscriptClick = function() {
    $('#cli_transcript').find('.request').click(function(event) {
      event.stopPropagation();
      setInputValue($(this).text());
    });
  }
  var setInputValue = function(theText) {
    document.getElementById("cli_input").value = theText;
    $('#cli_input').focus();
  }
  var setInputHistory = function(theText) {
    if (inputHistory.historyCommands.length >= inputHistory.maxLength) {
      var theDifference = (inputHistory.historyCommands.length - (inputHistory.maxLength - 1));
      inputHistory.historyCommands.splice(0,theDifference);
    }
    inputHistory.historyCommands.push(theText);
    inputHistory.currentPosition = (inputHistory.historyCommands.length - 1);
    if (doesLocalStorage) localStorage.inputHistory = JSON.stringify(inputHistory);
  }
  
});

$.after_request = function() {
  $('#cli_holder').scrollTop(document.getElementById("cli_holder").scrollHeight);
}

function showResponseMessage(responseMessage) {
  $('#cli_transcript').append('<li class="response">'+responseMessage+'</li>');
}