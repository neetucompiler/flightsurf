var BOT_CONNECTOR = 'q8O4PEwt7UU.cwA.mYQ.NjkC8GL_SvMWmH5pGpmFUgct5ZNx1HObGESJTtv54P8'
var $messages = $('.messages-content')
var $userInputField = $('#userInputText')
var feedBack = {
  logs: []
}

var d
var finalTranscript = ''
var recognizing = false
var userInputVal
var convoId

/**
 * For accessing LUIS API conversation
 */
function GetConversationId () {
  console.log('GetConversationId')
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
      }, 2000)
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

// botMessage(data)

$(window).on('load', function () {
  $messages.mCustomScrollbar()
  welcomeMessage()
})

$('.end-chat').click(function () {
  botMessage({
    message: 'Please provide us a feedback',
    type: 'feedback'
  })
  $('.feedback-bar').hide()
  disableUserInput('Thank you for using our services')
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
  $('.message.timestamp').remove()
  var temp = ''
  var rendered
  if (botMsg.type === 'feedback') {
    temp = $('#feedbackTemplate').clone()
  } else if (botMsg.type === 'video') {
    temp = $('#videoTemplate').clone().html()
    rendered = Mustache.render(temp, {
      attr: 'src',
      attrVal: botMsg.data
    })
    temp = $(rendered)
  } else if (botMsg.type === 'audio') {
    temp = $('#audioTemplate').clone().html()
    rendered = Mustache.render(temp, {
      attr: 'src',
      attrVal: botMsg.data
    })
    temp = $(rendered)
  } else if (botMsg.type === 'herocard') {
    temp = $(displayCard(botMsg.data).wrap('<p/>').parent())
  } else if (botMsg.type === 'choices') {
    var chtemp = $('#choicesMessage').clone().html()
    rendered = Mustache.render(chtemp, {
      message: botMsg.message,
      choices: faqs(botMsg.data)
    })
    temp = $(rendered)
  } else if (botMsg.type === 'normal' || !(botMsg.type)) {
    temp = $('#normalMessage').clone().html()
    rendered = Mustache.render(temp, {
      message: botMsg.message
    })
    temp = $(rendered)
  }
  // console.log('type: \t' + type + 'temp: \t' + $(temp).html())
  setDate(temp)
  $('.mCSB_container').append(temp.html())
  if (botMsg.type === 'herocard') {
    $('.mCSB_container').find('.rslides').responsiveSlides({
      auto: false,
      nav: true,
      prevText: '<i class="fa fa-arrow-left fa-2x" aria-hidden="true"></i>',
      nextText: '<i class="fa fa-arrow-right fa-2x" aria-hidden="true"></i>',
      pager: true
    })
  }
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

$('body').on('click', '.emoji', function () {
  $('.emoji').each(function () {
    $(this).attr('isactive', 'false')
    $(this).removeClass('jqactive')
  })
  $(this).addClass('jqactive')
  $(this).attr('isactive', 'true')
})

$('body').on('click', '#send_feedback', function (e) {
  if ($('textarea').val().length === 0) {
    e.preventDefault()
  } else {
    insertMessage('Thank you for your  rating of ' + $('.emoji.jqactive').attr('rating') + " and your comment '" + $('textarea').val() + "' ")
    feedBack.logs.push({
      finalRating: $('.emoji.jqactive').attr('rating'),
      finalFeedback: $(this).closest('.message').find('textarea').val()
    })
    $(this).prop('disabled', true)
  }
})

$('body').on('click', '.fa-thumbs-up', function () {
  $(this).addClass('f-active')
  $(this).closest('.message').find('.fa-thumbs-down').removeClass('f-active')

  var text = $(this).closest('.message').find('.botmessage').text()
  var status = 'OK'
  registerFeedback(feedBack, status, text)
  console.log(feedBack)
  $(this).closest('.message').find('.shoutout').hide()
  $(this).effect('bounce', {
    times: 4
  }, 700)
  updateScrollbar()
})

$('body').on('click', '.fa-thumbs-down', function () {
  $(this).addClass('f-active')
  $(this).closest('.message').find('.fa-thumbs-up').removeClass('f-active')

  if ($(this).closest('.message').find('.shoutout').length === 0) {
    var temp = $('<div class="shoutout"><br><br><hr><table><tr><td>Let us know why:</td><td><textarea class="shoutout_msg" name="dislike" placeholder="Enter here"></textarea></td><td><i class="fa fa-bullhorn fa-2x" aria-hidden="true"></i></td></tr></table></div>')
    temp.appendTo($(this).closest('.message'))
  }
  var text = $(this).closest('.message').find('.botmessage').text()
  var status = 'not OK'
  registerFeedback(feedBack, status, text)
  console.log(feedBack)
  $(this).closest('.message').find('.shoutout').show()
  $(this).closest('.message').find('.fa-bullhorn').show()
  $(this).effect('bounce', {
    times: 4
  }, 700)
  updateScrollbar()
})

$('body').on('click', '.shoutout_msg .fa-bullhorn', function () {
  var text = $(this).closest('.message').find('.botmessage').text()
  var status = 'not OK'
  var bullhornText = $(this).closest('tr').find('.shoutout_msg').val()
  registerFeedback(feedBack, status, text, bullhornText)
  console.log(feedBack)
  $(this).closest('.shoutout').hide()
})

function displayCard (cards) {
  var $parentCard = $('.parentCard').clone()
  // ul encapsulation starts here
  var $parentList = $('<ul class="rslides"></ul>')
  for (var i = 0; i < cards.carousel.container.length; i++) {
    // li encapsulation for each iteration
    var $listTemp = $('<li></li>')
    for (var key in cards.carousel.container[i]) {
      // entire loop must be encapsulated in one li
      switch (key) {
        case 'title':
          $listTemp.append(displayTitle(cards.carousel.container[i][key]))
          break
        case 'image':
          $listTemp.append(displayImage(cards.carousel.container[i][key]))
          break
        case 'audio':
          $listTemp.append(displayAudio(cards.carousel.container[i][key]))
          break
        case 'video':
          $listTemp.append(displayVideo(cards.carousel.container[i][key]))
          break
        case 'buttons':
          $listTemp.append(displayButtons(cards.carousel.container[i][key]))
          break
        default:
          $listTemp.append(displayDefault())
      }
    }
    $parentList.append($listTemp)
  }
  // console.log($parentList.html())
  $parentCard.append($parentList)

  return $parentCard
}

function displayDefault () {
  var $default = $('<h3>Nothing to display</h3>')
  return $default
}

function displayTitle (title) {
  var titletemp = $('.titleCard').clone().html()
  var rendered = Mustache.render(titletemp, {
    titlemsg: title
  })
  return $(rendered).html()
}

function displayImage (image) {
  var imgtemp = $('.imageCard').clone().html()
  return renderAudioVideoImage(imgtemp, image)
}

function displayAudio (audio) {
  var audiotemp = $('.audioCard').clone().html()
  return renderAudioVideoImage(audiotemp, audio)
}

function displayVideo (video) {
  var videotemp = $('.videoCard').clone().html()
  return renderAudioVideoImage(videotemp, video)
}

function displayButtons (buttons) {
  var btntemp = $('.buttonCard').clone().html()
  Mustache.parse(btntemp)
  var rendered = Mustache.render(btntemp, {
    button: buttons
  })
  return rendered
}

function renderAudioVideoImage (doc, url) {
  var rendered = Mustache.render(doc, {
    attr: 'src',
    attrVal: url
  })
  return $(rendered).html()
}

function registerFeedback (feedback, status, text, shoutout) {
  var check = checkFeedback(feedback, text)
  if (check < 0) {
    addToFeedback(feedBack, status, text)
  } else {
    modifyFeedback(feedBack, check, status, shoutout)
  }
}

function checkFeedback (feedback, text) {
  var index = -1
  if (feedback.logs.length < 1) {
    return -1
  }
  for (var i = 0; i < feedback.logs.length; i++) {
    if (feedback.logs[i].text === text) {
      index = i
    }
  }
  return index
}

function modifyFeedback (feedback, index, status, message) {
  feedback.logs[index].status = status
  if (message) {
    feedback.logs[index].feedback = message
  } else {
    feedback.logs[index].feedback = 'NA'
  }
}

/**
 *
 * Pushes to feedBack Object
 * @param {any} feedback the feedback from the user
 * @param {any} stat status of the feedback eg:Ok/Not Ok
 * @param {any} mtext bot text for which feedback has been given
 */
function addToFeedback (feedback, stat, mtext) {
  feedback.logs.push({
    status: stat,
    text: mtext
  })
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
// $('#generalForm').submit(function() {
//   var msg = $userInputField.val()
//   disableUserInput('Please Wait...')
//   insertMessage(msg)
//   enableUserInput('Please Type!')
//   return false
// })
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

/**
 * Construct faqs html to be appended
 * @param {any} choices array of choices
 * @returns constructed html of bot choices
 */
function faqs (choices) {
  if (choices !== undefined && choices.length > 1) {
    var choicesBotMessage = '<div class="chatBtnHolder">'
    for (var i = 0; i < choices.length; i++) {
      // choicesBotMessage += '<button class="chatBtn" onclick="choiceClick(\'' + i + '\')" value="' + choices[i] + '">' + choices[i] + '</button>';
      choicesBotMessage += '<button class="chatBtn" value="' + choices[i] + '">' + choices[i] + '</button>'
    }
    choicesBotMessage += '</div>'
    return choicesBotMessage
  }
}

function disableMainContent () {
  var contents = ['messages', 'faqs', 'helpdesk', 'announcements', 'search']
  contents.forEach(function (element) {
    $('.' + element).css('display', 'none')
    // console.log(element)
  }, this)
}

function faqBtnClick () {
  disableMainContent()
  $('.faqs').css('display', 'block')
  console.log('enable faqs')
}

function helpdeskBtnClick () {
  disableMainContent()
  $('.helpdesk').css('display', 'block')
  console.log('enable helpdesk')
}

function searchBtnClick () {
  disableMainContent()
  $('.search').css('display', 'block')
  console.log('enable search')
}

function announcementBtnClick () {
  disableMainContent()
  $('.announcements').css('display', 'block')
  console.log('enable announcement')
}

function backToChatBtnClick () {
  disableMainContent()
  $('.messages').css('display', 'block')
  console.log('enable messages')
}

$('.top-menu-bar button').click(function () {
  // make all top menu button disabled
  $('.top-menu-bar button').each(function () {
    if ($(this).hasClass('top-menu-bar-selected')) {
      console.log('disable all button')
      $(this).removeClass('top-menu-bar-selected')
    }
  })
  // only make the selected button as selected
  $(this).addClass('top-menu-bar-selected')
  console.log('enable current button')
})

$('button.backToChatBtn').click(function () {
  // make all top menu button disabled
  $('.top-menu-bar button').each(function () {
    if ($(this).hasClass('top-menu-bar-selected')) {
      console.log('disable all button')
      $(this).removeClass('top-menu-bar-selected')
    }
  })
})

var options = {
  url: 'resources/countries.json', // load any json
  getValue: 'name',
  list: {
    match: {
      enabled: true
    },
    maxNumberOfElements: 8
  },
  theme: 'dark'
}

// Sample for sending bot message
function welcomeMessage () {
  botMessage({
    message: 'Hi there, I\'m Thai Bot and I am here to assist you. I can help you with regional and intercontinental performance report',
    type: 'normal'
  })
  enableUserInput('Please ask your query')
}

$('#chat-search').easyAutocomplete(options)
