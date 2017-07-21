var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var path = require('path')
var pat = path.resolve(__dirname)
var request = require('request')
var watson = require('watson-developer-cloud')

var luisSpellCheckFlag = false
var ibmToneAnalyzeFlag = false
var luisSentimentFlag = true

var toneAnalyzer = watson.tone_analyzer({
  username: '696c234d-482f-4114-8b37-48e9c4e34a65',
  password: 'aReFPL1VzyWN',
  version: 'v3',
  version_date: '2016-05-19 '
})

// Set the headers
var headers = {
  'Ocp-Apim-Subscription-Key': '8a69fdc2ae7b4d1c9f52d3293031a94d'
}
// Configure the request
var options = {
  url: 'https://api.cognitive.microsoft.com/bing/v5.0/spellcheck/?text=',
  method: 'GET',
  headers: headers
}

var headersTextAnalysis = {
  'Ocp-Apim-Subscription-Key': '7b373a55a2b34d169a77fdeaaa8b97df'
}
var bodySentiment = {
  'documents': [{
    'language': 'en',
    'id': 'string'
  }]
}
// Configure the request
var optionsTextAnalysis = {
  url: 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',
  method: 'POST',
  headers: headersTextAnalysis,
  json: true,
  body: bodySentiment
}

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, '/public')))
app.get('/', function (req, res) {
  res.sendFile(pat + '/public/index.html')
})

// do spellcheck, analyze tone on receiving a message from the user
io.on('connection', function (socket) {
  console.log('a user is connected')
  loadTemplatesToClient()
  socket.on('usermsg', function (msg, callback) {
    console.log(msg)
    if (ibmToneAnalyzeFlag === true) {
      doToneAnalyze(msg)
      deliverCallback(callback, msg)
    }

    if (luisSpellCheckFlag === true) {
      initiateSpellCheck(msg, callback)
    }

    if (luisSentimentFlag === true) {
      bodySentiment.documents[0].text = msg
      doLuisSentimentAnalysis()
      deliverCallback(callback, msg)
    }
  })
  socket.on('disconnect', function () {
    console.log('a user is disconnected')
  })
})

http.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('Connected')
})

function checkForSpell (tokenObj, splitText) {
  if (tokenObj.flaggedTokens.length === 0) {
    console.log('no corrections')
    return 0
  } else {
    for (var i = 0; i < tokenObj.flaggedTokens.length; i++) {
      splitText[splitText.indexOf(tokenObj.flaggedTokens[i].token)] = tokenObj.flaggedTokens[i].suggestions[0].suggestion
    }
  }
  return splitText
}

// loads all the message capabilities of the bot after successfull connection
function loadTemplatesToClient () {
  var cards = {
    carousel: {
      container: [{
        title: 'First slide',
        image: 'th.jpg',
        buttons: ['OK', 'Cancel', 'Submit', 'Send', 'Abort']
      },
      {
        title: 'Second slide',
        image: 'images/icon.png',
        buttons: ['Alpha', 'Beta']
      },
      {
        title: 'Third slide',
        video: 'video.mp4'
      },
      {
        title: 'Fourth slide',
        audio: 'audio.mp3',
        buttons: ['link', 'embed']
      }
      ]
    }
  }

  var botMsg = {}
  // Here are some examples of Bot Messages and its type.
  botMsg.message = 'Hi! I\'m your insurance advisor. How may I help you.'
  // Herocard message, type = 'herocard', cards = json object
  io.emit('botmsg', botMsg)
  botMsg.message = 'Hero cards demo'
  botMsg.type = 'herocard'
  botMsg.data = cards

  io.emit('botmsg', botMsg)
  // Video Message, type = 'video', url of the video
  botMsg.message = 'Video display'
  botMsg.type = 'video'
  botMsg.data = 'video.mp4'
  io.emit('botmsg', botMsg)
  // Audio Message, type = 'audio', url of the audio
  botMsg.message = 'Audio play'
  botMsg.type = 'audio'
  botMsg.data = 'audio.mp3'
  io.emit('botmsg', botMsg)
  // Faq Question, type = 'choices', Array of choices
  // botMessage('What do you want to do today', 'choices', ['how\'s weather', 'order pizza', 'go shopping', 'schedule a meeting'])
  botMsg.message = 'Select from the following'
  botMsg.type = 'choices'
  botMsg.data = ['first', 'second', 'third', 'fourth']
  io.emit('botmsg', botMsg)
}

function doToneAnalyze (msg) {
  console.log('inside tone analyse')
  toneAnalyzer.tone({
    text: msg
  },
    function (err, tone) {
      if (err) {
        io.emit('toneAnalyse', err)
        console.log(err)
        io.emit('toneAnalyse', 'Error ocurred in IBM tone analyse')
      } else {
        console.log(JSON.stringify(tone, null, 2))
        io.emit('toneAnalyse', JSON.stringify(tone, null, 2))
      }
    })
}

function initiateSpellCheck (msg, callback) {
  options.url += msg
  request(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log(body)
      var textArray = msg
      textArray = msg.split(' ')
      var jsonToken = JSON.parse(body)
      var correctedText = checkForSpell(jsonToken, textArray)
      if (!correctedText) {
        console.log('no corrections')
        deliverCallback(callback, msg)
      } else {
        console.log(correctedText.join(' '))
        deliverCallback(callback, correctedText.join(' '))
      }
    } else {
      console.log('unsuccesfull spell check')
      deliverCallback(callback, msg)
    }
  })
}

function doLuisSentimentAnalysis () {
  request(optionsTextAnalysis, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        // Print out the response body
      console.log('TextAnalysis: ' + JSON.stringify(body))
      io.emit('luisSentiment', JSON.stringify(body))
    } else {
      console.log('unsuccesfull text analytics: ' + error + JSON.stringify(response))
      io.emit('luisSentiment', 'Error ocurred for Luis Sentiment')
    }
  })
}

function deliverCallback (callback, msg) {
  callback(msg)
  io.emit('botmsg', {message: 'this is a sample message from the bot'})
}
