// BOTKIT LIBRARY
const path = require('path')
const WebBot = require(path.join(__dirname, './lib/WebBot.js'))
const rasa = require('./src/middleware-rasa')({
  rasa_uri: 'http://ubuntuvm.southcentralus.cloudapp.azure.com:5000',
  rasa_model: undefined
})

const express = require('express')
const app = express()
const http = require('http').Server(app)

// const auth = require('http-auth')
// var basic = auth.basic({
// realm: 'ChatBot Application.'
// }, (username, password, callback) => {
// // Custom authentication
// // Use callback(error) if you want to throw async error.
// callback(username === 'ChatBotDemo' && password === 'ChatBotDemo!432')
// })
// app.use(auth.connect(basic))
// intents
// ----------------
// greet
// intro
// issue	entity	prod_type,	prod_var
// order_package
// order_appointment
// order_history
// order_track	entity	order_id
// order

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile('public/index.html', {
    root: __dirname
  })
})
let controller = WebBot({
  debug: false,
  stats_optout: true
}, http)

controller.middleware.receive.use(rasa.receive)
controller.spawn()

let errMsg = 'I am in training mode. Please bear with us. You can have call-assistant @ 1800-XXXX-XXXX'

let confiCheck = (message, level) => {
  if (message.confidence >= (Number(level) || 0.5)) {
    return true
  }
  return false
}

controller.hears(['greet'], 'message_received', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) throw err
    if (confiCheck(message, 0.5)) {
      convo.say('Hello, Welcome! I am Thai bot. I can help you with sales report')
    } else {
      convo.say(errMsg)
    }
  })
})

controller.hears(['regional_routes_perf'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  if (message.entities.length > 0) {
    for (var i in message.entities) {
      if (message.entities[i].entity === 'time_period' && message.entities[i].value === 'month') {
        bot.reply(message, 'Regional routes added revenue 60% of your target. Total revenue Earned this Month  is 3600 Mio THB of Target 6000 Mio THB. -8% compared to last year')
      } else if (message.entities[i].entity === 'time_period' && message.entities[i].value === 'year') {
        bot.reply(message, 'Regional routes added revenue 40% of your target. Total revenue Earned this year till date is 68000 Mio THB of Target 170,000 Mio THB. +12% compared to last year')
      } else if (message.entities[i].entity === 'time_period' && message.entities[i].value === 'quarter') {
        console.log('inside quarter inside quarter inside quarter inside quarter')
        bot.reply(message, 'Regional routes added revenue 85% of your target. Total revenue Earned this quarter is 21250 Mio THB of Target 25,000 Mio THB. +15 % compared to last year')
      } else {
        bot.reply(message, 'Regional routes added revenue 40% of your target. Total revenue Earned this year till date is 68000 Mio THB of Target 170,000 Mio THB. +12% compared to last year')
      }
    }
  } else {
    bot.reply(message, 'Regional routes added revenue 40% of your target. Total revenue Earned this year till date is 68000 Mio THB of Target 170,000 Mio THB. +12% compared to last year')
  }
})

controller.hears(['intercontinental_routes_perf'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  if (message.entities.length > 0) {
    for (var i in message.entities) {
      if (message.entities[i].entity === 'time_period' && message.entities[i].value === 'month') {
        bot.reply(message, 'Continental routes added revenue 78% of your target. Total revenue Earned this Month  till date is 4,680 Mio THB of Target 6,000 Mio THB. +4% compared to last year')
      } else if (message.entities[i].entity === 'time_period' && message.entities[i].value === 'year') {
        bot.reply(message, 'Continental routes added revenue 35% of your target. Total revenue Earned this year till date is 24,500 Mio THB of Target 70,000 Mio THB. -15% compared to last year')
      } else if (message.entities[i].entity === 'time_period' && message.entities[i].value === 'quarter') {
        bot.reply(message, 'Continental routes added revenue 60% of your target. Total revenue Earned this Quarter till date is 12,000 Mio THB of Target 20,000 Mio THB. +4% compared to last year')
      } else {
        bot.reply(message, 'Continental routes added revenue 35% of your target. Total revenue Earned this year till date is 24,500 Mio THB of Target 70,000 Mio THB. -15% compared to last year')
      }
    }
  } else {
    bot.reply(message, 'Continental routes added revenue 35% of your target. Total revenue Earned this year till date is 24,500 Mio THB of Target 70,000 Mio THB. -15% compared to last year')
  }
})

controller.hears(['location_specific_routes_perf'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  if (message.entities.length > 0) {
    for (var j in message.entities) {
      if (message.entities[j].entity === 'location' && message.entities[j].value.toLowerCase() === 'northern') {
        bot.reply(message, 'Northen routes contributed 47% of Regional revenue earned (31000 / 68000)')
      } else if (message.entities[j].entity === 'location' && (message.entities[j].value.toLowerCase() === 'indochina' || 'indo china')) {
        bot.reply(message, 'Indo China route earned 12% of Regional revenue earned (8160 / 68000)')
      } else {}
    }
  }
})

controller.hears(['market_share'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  if (message.entities.length > 0) {
    for (var j in message.entities) {
      if (message.entities[j].entity === 'location' && message.entities[j].value.toLowerCase() === 'sydney') {
        bot.reply(message, 'For Bangkok-Sydney route, TG market share is 50%.  Emirates-28% and Qantas-18% also compete mostly in this region')
      } else if (message.entities[j].entity === 'location' && message.entities[j].value.toLowerCase() === 'beijing') {
        bot.reply(message, 'For Bangkok- Beijing route, TG market share is 33%.  AirChina-30% and Hainan-18% also compete mostly in this region')
      } else {}
    }
  }
})

controller.hears(['intro'], 'message_received', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('I am your Bot Assitant. Here to answer your queries on sales report')
    } else {
      convo.say(errMsg)
    }
  })
})

// // The below code does not work
// app.set('port', 3001)
// app.listen(app.get('port'), () {
// console.log(`Example app listening on port ${app.get('port')}`)
// })

app.set('port', process.env.port || process.env.PORT || 62000)
http.listen(app.get('port'), () => {
  console.log(`listening on *:${app.get('port')}`)
})
