var BOT_CONNECTOR = 'q8O4PEwt7UU.cwA.mYQ.NjkC8GL_SvMWmH5pGpmFUgct5ZNx1HObGESJTtv54P8'
var $messages = $('.messages-content')
var $userInputField = $('#userInputText')

var d
var finalTranscript = ''
var recognizing = false
var userInputVal
var convoId

/**
 * For accessing LUIS API conversation
 */
function GetConversationId () {
  $.ajax({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + BOT_CONNECTOR
    },
    // DIRECT LINE API 1.1 url: 'https://directline.botframework.com/api/conversations'
    url: 'https://directline.botframework.com/v3/directline/conversations'
  }).then(function (response) {
    convoId = response['conversationId']
    $('<div class="message loading new"><figure class="avatar"><img src="images/icon.png" /></figure><span></span></div>').appendTo($('.mCSB_container'))
    setTyping()
    updateScrollbar()
    setTimeout(function () {
      PostMessage()
    }, 1000)
  })
}

/**
 * For accessing LUIS API conversation
 */
function PostMessage () {
  var dataToBePassed = {
    'type': 'message',
    'text': userInputVal,
    'from': {
      'id': 'user1'
    }

  }

  $.ajax({
    url: 'https://directline.botframework.com/v3/directline/conversations/' + convoId + '/activities',
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + BOT_CONNECTOR
    },
    data: JSON.stringify(dataToBePassed),
    success: function (data, status) {
      setTimeout(function () {
        GetMessage()
      }, 3000)
    }
  })
}

/**
 * For accessing LUIS API conversation
 */
function GetMessage () {
  $.ajax({
    url: 'https://directline.botframework.com/v3/directline/conversations/' + convoId + '/activities',
    type: 'get',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + BOT_CONNECTOR
    },
    success: function (response) {
      console.log('Bot Response from LUIS :' + response['activities'][response['watermark']]['text'])
      var botJsonMsg = {
        'message': response['activities'][response['watermark']]['text'],
        'type': 'normal'
      }
      botMessage(botJsonMsg)
    }
  })
}

function disableUserInput (placeholderText) {
  placeholderText = placeholderText || 'Please Wait...' // Default text
  $userInputField.blur() // Remove the focus from the user input field
  $userInputField.val('') // Remove the text from the user input field
  $userInputField.attr('disabled', 'true') // Disable the user input field
  $userInputField.attr('placeholder', placeholderText) // Change the placeholder to ask the user to wait
  $('.message-box').addClass('disabledCursor')
  $('.message-submit').attr('disabled', 'true')
  $('#enabledVoiceBtn').css('display', 'none')
  $('#disabledVoiceBtn').css('display', 'block')
  $('#generalForm').css('cursor', 'not-allowed')
}

function enableUserInput (placeholderText) {
  placeholderText = placeholderText || 'Please Type!' // Default text
  $userInputField.focus() // Remove the focus from the user input field
  $userInputField.removeAttr('disabled') // Enable the user input field
  $userInputField.attr('placeholder', placeholderText) // Change the placeholder to prompt input from the user
  $('.message-box').removeClass('disabledCursor')
  $('.message-submit').removeAttr('disabled')
  $('#enabledVoiceBtn').css('display', 'block')
  $('#disabledVoiceBtn').css('display', 'none')
  $('#generalForm').removeAttr('style')
}

$(document).ready(function () {
  $messages.mCustomScrollbar()
  welcomeMessage()

  $('.end-chat').click(function () {
    botMessage({
      message: 'Please provide us a feedback',
      type: 'feedback'
    })
    $('.feedback-bar').hide()
    disableUserInput('Thank you for using our services')
  })
})

function updateScrollbar () {
  $messages.mCustomScrollbar('update').mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  })
}

function formatAMPM (date) {
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var ampm = hours >= 12 ? 'pm' : 'am'
  var hour = hours % 12
  hours = hours ? hour : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  var strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}

function setDate (t) {
  d = new Date()
  t.find('.message').append($('<div class="timestamp">' + formatAMPM(d) + '</div>'))
}

function setTyping () {
  $('<div class="timestamp">Typing...</div>').appendTo($('.message:last'))
}

/**
 *
 * Insert user input message
 * @param {any} msg User's input text
 * @returns false if user message is null
 */
function insertMessage (msg) {
  if ($.trim(msg) === '') {
    return false
  }
  var temp = $('<div class="message message-personal">' + msg + '</div>')
  temp.appendTo($('.mCSB_container')).addClass('new')
  setDate(temp)
  $('.message-input').val(null)
  updateScrollbar()
}

/**
 *
 * Create a new utterance for the specified text and add it to
 * the queue.
 * @param {any} response message from bot
 */
function speak (text) {
  var msg = new SpeechSynthesisUtterance()
  msg.text = text
  speechSynthesis.speak(msg)
}

/**
 *
 * Insert bot message
 * @param {any} botmsg the bot message
 * @param {any} type type of message
 * @param {any} data the data/url required for the type of message
 * @returns false if no message is passed
 */
function botMessage (botMsg) {
  $('.message.loading').remove()
  $('.message .timestamp:last').remove()
  var temp = ''
  var rendered
  if (botMsg.type === 'normal' || !(botMsg.type)) {
    temp = $('#normalMessage').clone().html()
    rendered = Mustache.render(temp, {
      message: botMsg.message
    })
    temp = $(rendered)
  }
  setDate(temp)
  $('.mCSB_container').append(temp.html())
  updateScrollbar()
  playSound('bing')
}

/**
 * Plays a soundfile
 * @param {any} filename source and name of the file
 */
function playSound (filename) {
  document.getElementById('sound').innerHTML = '<audio autoplay="autoplay"><source src="' + filename + '.mp3" type="audio/mpeg" /><source src="' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + filename + '.mp3" /></audio>'
}

var setTimeoutID
$('#minim-chat').click(function () {
  $('#minim-chat').css('display', 'none')
  $('#maxi-chat').css('display', 'block')
  // var height = ($(".chat").outerHeight(true) - 46) * -1;
  // $(".chat").css("margin", "0 0 " + height + "px 0");
  $('.chat').css('margin', '0 0 -344px 0')
  setTimeoutID = setTimeout(function () {
    $('#animHelpText').css('display', 'block')
  }, 1500)
})
$('#maxi-chat').click(function () {
  $('#minim-chat').css('display', 'block')
  $('#maxi-chat').css('display', 'none')
  $('.chat').css('margin', '0')
  $('#animHelpText').css('display', 'none')
  clearTimeout(setTimeoutID)
})

/**
 * Called when the Submit button is clicked
 */
function submitForm (e) {
  e.preventDefault()
  userInputVal = $userInputField.val()
  insertMessage(userInputVal)
  if (userInputVal) {
    GetConversationId()
  }
}

// Form Submit - Send Button
$('#generalForm').bind('submit', submitForm)

$(document).ready(function () {
  // check that your browser supports the API
  if ((window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition) === undefined) {
    console.log('Sorry, your Browser does not support the Speech API')
    $('#userInputVoice').css('display', 'none')
  } else {
    // Create the recognition object and define the event handlers
    var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)()
    recognition.continuous = true // keep processing input until stopped
    recognition.interimResults = true // show interim results
    recognition.lang = 'en-US' // specify the language
    recognition.onstart = function () {
      recognizing = true
      console.log('Speak slowly and clearly')
      console.log('Click to Stop')
    }
    recognition.onerror = function (event) {
      console.log('There was a recognition error...')
    }
    recognition.onend = function () {
      console.log('iam ended')
      recognizing = false
    }
    recognition.onresult = function (event) {
      console.log('iam in result')
      var interimTranscript = ''
      // Assemble the transcript from the array of results
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }
      console.log('interim:  ' + interimTranscript)
      console.log('final:    ' + finalTranscript)
      // update the page
      if (finalTranscript.length > 0) {
        $userInputField.val(finalTranscript)
        recognition.stop()
        // $('#start_button').html('Click to Start Again');
        recognizing = false
      }
    }
    $('#enabledVoiceBtn').click(function (e) {
      if (recognizing) {
        recognition.stop()
        // $('#start_button').html('Click to Start Again');
        recognizing = false
      } else {
        finalTranscript = ''
        // Request access to the User's microphone and Start recognizing voice input
        recognition.start()
        $userInputField.html('&nbsp;')
      }
    })
  }
})

// Initial Bot Message
function welcomeMessage () {
  botMessage({
    message: 'Hi there, I\'m Thai Bot and I am here to assist you. I can help you with regional and intercontinental performance report',
    type: 'normal'
  })
  enableUserInput('Please ask your query')
}
