var path = require('path')
var Botkit = require(path.join(__dirname, '/CoreBot.js'))
var io = require('socket.io')
console.log('inside webot')

function TextBot (configuration, http) {
  var masterSocket
  var textBotkit = Botkit(configuration || {})

  textBotkit.middleware.spawn.use(function (bot, next) {
    textBotkit.listenStdIn(bot)
    next()
  })

  textBotkit.defineBot(function (botkit, config) {
    var bot = {
      botkit: botkit,
      config: config || {},
      utterances: botkit.utterances
    }

    bot.startConversation = function (message, cb) {
      botkit.startConversation(this, message, cb)
    }

    bot.createConversation = function (message, cb) {
      botkit.createConversation(this, message, cb)
    }

    bot.send = function (message, cb) {
      cb && cb(null, message)
    }

    bot.reply = function (src, resp, cb) {
      var msg = {}

      if (typeof (resp) === 'string') {
        msg.text = resp
      } else {
        msg = resp
      }

      msg.channel = src.channel

      bot.say(msg, cb)

      console.log('Bot says: ' + msg.text)
      masterSocket.emit('chat response', msg.text)
    }

    bot.findConversation = function (message, cb) {
      botkit.debug('CUSTOM FIND CONVO', message.user, message.channel)
      for (var t = 0; t < botkit.tasks.length; t++) {
        for (var c = 0; c < botkit.tasks[t].convos.length; c++) {
          if (
            botkit.tasks[t].convos[c].isActive() &&
            botkit.tasks[t].convos[c].source_message.user === message.user
          ) {
            botkit.debug('FOUND EXISTING CONVO!')
            cb(botkit.tasks[t].convos[c])
            return
          }
        }
      }
      cb()
    }
    return bot
  })

  textBotkit.listenStdIn = function (bot) {
    textBotkit.startTicking()
    io(http).sockets.on('connection', function (socket) {
      socket.on('chat message', function (msg) {
        console.log('message received ' + msg)

        var message = {
          text: msg,
          user: 'user',
          channel: 'text',
          timestamp: Date.now()
        }
        masterSocket = socket

        textBotkit.receiveMessage(bot, message)
      })
    })
  }

  return textBotkit
}

module.exports = TextBot
