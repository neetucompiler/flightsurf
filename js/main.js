var msgsContainer = jQ('.messages-content')
var userInputField = jQ('#userInputText')

function updateScrollbar() {
  msgsContainer.mCustomScrollbar('update').mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  })
}

function playSound(filename) {
  jQ('<audio autoplay="autoplay"><source src="/public/' + filename + '.mp3" type="audio/mpeg" /><source src="/public/' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="/public/' + filename + '.mp3" /></audio>').appendTo(jQ('#sound'))
}

function setTimeStamp(customTimeStamp) {
  if (jQ.trim(customTimeStamp) === '') {
    jQ('<div class="timestamp">' + formatAMPM(new Date()) + '</div>').appendTo(jQ('.message:last'))
    return false
  }
  jQ('<div class="timestamp">' + customTimeStamp + '</div>').appendTo(jQ('.message:last'))
}

function setTyping() {
  var correctElement = msgsContainer.find('.mCSB_container')
  if (!correctElement.length) {
    console.log('No element found with .mCSB_container')
    return false
  }
  jQ('<div class="message loading new"><figure class="avatar"><img src="/public/images/icon.png" /></figure><span></span></div>').appendTo(correctElement)
  jQ('<div class="timestamp">Typing...</div>').appendTo(jQ('.message:last'))
  updateScrollbar()
}

function disableUserInput(placeholderText) {
  placeholderText = placeholderText || 'Please Wait...' // Default text
  userInputField.blur() // Remove the focus from the user input field
  userInputField.val('') // Remove the text from the user input field
  userInputField.attr('disabled', 'true') // Disable the user input field
  userInputField.attr('placeholder', placeholderText) // Change the placeholder to ask the user to wait
  jQ('.message-box').addClass('disabledCursor')
  jQ('.message-submit').attr('disabled', 'true')
}

function enableUserInput(placeholderText) {
  placeholderText = placeholderText || 'Please Type!' // Default text
  userInputField.focus() // Remove the focus from the user input field
  userInputField.removeAttr('disabled') // Enable the user input field
  userInputField.attr('placeholder', placeholderText) // Change the placeholder to prompt input from the user
  jQ('.message-box').removeClass('disabledCursor')
  jQ('.message-submit').removeAttr('disabled')
}

function insertUserMessage(msg) {
  if (jQ.trim(msg) === '') {
    console.log('The msg parameter was empty or null')
    return false
  }
  var correctElement = msgsContainer.find('.mCSB_container')
  if (!correctElement.length) {
    console.log('No element found with .mCSB_container')
    return false
  }
  jQ('<div class="message new message-personal">' + msg + '</div>').appendTo(correctElement)
  setTimeStamp()
  jQ('.message-input').val('')
  jQ('.message.loading').remove()
  jQ('.message.timestamp').remove()
  updateScrollbar()
}

function displayBotMessage(botMessage, timeout, choices) {
  if (jQ.trim(botMessage) === '') {
    return false
  }
  var correctElement = msgsContainer.find('.mCSB_container')
  if (!correctElement.length) {
    return false
  }
  if (timeout) {
    setTimeout(function() {
      setTyping()
    }, timeout / 2)
    setTimeout(function() {
      jQ('<div class="message new"><figure class="avatar"><img src="/public/images/icon.png" /></figure>' + botMessage + '</div>').appendTo(correctElement)
      setTimeStamp()
      jQ('.message.loading').remove()
      jQ('.message.timestamp').remove()
      updateScrollbar()
      playSound('bing')
    }, timeout)
  } else {
    jQ('<div class="message new"><figure class="avatar"><img src="/public/images/icon.png" /></figure>' + botMessage + '</div>').appendTo(correctElement)
    setTimeStamp()
    playSound('bing')
  }

  // if the choices exists and has atleast 2 choices
  if (choices !== undefined && choices.length > 1) {
    var choicesBotMessage = '<div class="chatBtnHolder new">'
    for (var i = 0; i < choices.length; i++) {
      choicesBotMessage += '<button class="chatBtn" onclick="choiceClick(\'' + i + '\')" value="' + choices[i] + '">' + choices[i] + '</button>'
    }
    choicesBotMessage += '</div>'
    if (timeout) {
      setTimeout(function() {
        jQ(choicesBotMessage).appendTo(correctElement)
        playSound('bing')
        jQ('.message.loading').remove()
        jQ('.message.timestamp').remove()
        updateScrollbar()
      }, timeout)
    } else {
      jQ(choicesBotMessage).appendTo(correctElement)
      playSound('bing')
    }
  }

  jQ('.message.loading').remove()
  jQ('.message.timestamp').remove()
  updateScrollbar()
}

function formatAMPM(date) {
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  var strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}

var setTimeoutID
var mini = 0
var max = 0
jQ('#minim-chat').click(function() {
  jQ('#minim-chat').css('display', 'none')
  jQ('#maxi-chat').css('display', 'block')
  jQ('.chat').css('margin', '0 0 -354px 0')
  setTimeoutID = setTimeout(function() {
    jQ('#animHelpText').css('display', 'block')
  }, 1500)
})
jQ('#maxi-chat').click(function() {
  jQ('#minim-chat').css('display', 'block')
  jQ('#maxi-chat').css('display', 'none')
  jQ('.chat').css('margin', '0')
  jQ('#animHelpText').css('display', 'none')
  clearTimeout(setTimeoutID)
})

jQ(document).ready(function() {
  msgsContainer.mCustomScrollbar()
  displayBotMessage('Please Ask your Query!', 2000)
})

jQ('#generalForm').submit(function() {
  var msg = userInputField.val()
  disableUserInput('Please Wait...')
  insertUserMessage(msg)
  enableUserInput('Please Type!')
  return false
})

// // Use the below to display the bot message
// displayBotMessage(botMessage, 2000)
// enableUserInput('Please ask your query')