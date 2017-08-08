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

controller.hears(['greet'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) throw err
    if (confiCheck(message, 0.5)) {
      convo.say('Hello, Welcome! I am PLM bot. I can help you with order and issues')
    } else {
      convo.say(errMsg)
    }
  })
})

controller.hears(['issue'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  if (message.entities.length > 0) {
    for (var i in message.entities) {
      if (message.entities[i].entity === 'prod_type') {
        bot.startConversation(message, askProductVariant)
      } else if (message.entities[i].entity === 'prod_var') {
        bot.startConversation(message, askProductName)
      } else {
        bot.startConversation(message, askProdNameVar)
      }
    }
  } else {
    bot.startConversation(message, askProdNameVar)
  }
})

var askProdNameVar = (response, convo) => {
  convo.ask('What is the product name?', (response, convo) => {
    convo.say('Ok. Thanks for your information')
    askProductVariant(response, convo)
    convo.next()
  })
}

var askProductName = (response, convo) => {
  convo.ask('What is the product name?', (response, convo) => {
    convo.say('Ok. Thanks for your information')
    convo.say('Your issue will be fixed by our concern team.')
    convo.next()
  })
}

var askProductVariant = (response, convo) => {
  convo.ask('What is the product variant?', (response, convo) => {
    convo.say('Ok. Thanks for your information')
    convo.say('Your issue will be fixed by our concern team.')
    convo.next()
  })
}

controller.hears(['order'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your order details will be displayed here (once retrieved from API call)')
    } else {
      convo.say(errMsg)
    }
    // convo.say('If you want to know about your previous orders.Kindly enter what do you want Order Status/Order Details')
  })
})
// controller.hears(['order_status'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
//   bot.startConversation(message, (err, convo) => {
//     if (err) { throw err }
//     if (confiCheck(message, 0.5)) {
//       convo.say('Your order status will be displayed here (once retrieved from API call)')
//       convo.say('Ex: Your present Order with OrderId ABCD1234 is in process, expected to be completed on DD-MM-YYYY')
//     } else {
//       convo.say(errMsg)
//     }
//   })
// })

// controller.hears(['order_details'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
//   bot.startConversation(message, (err, convo) => {
//     if (err) { throw err }
//     if (confiCheck(message, 0.5)) {
//       convo.say('Your order status will be displayed here (once retrieved from API call)')
//       convo.say('Ex: Your present Order with OrderId ABCD1234 is in process, expected to be completed on DD-MM-YYYY')
//     } else {
//       convo.say(errMsg)
//     }
//   })
// })

controller.hears(['order_track'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  if (message.entities.length > 0) {
    bot.startConversation(message, orderDetails)
  } else {
    bot.startConversation(message, getOrderID)
  }
})

var orderDetails = (response, convo) => {
  convo.say('Ok. Thanks for your information')
  convo.say('Your order details will be available soon')
  convo.say('NOTE: As details fetched from API call')
}

var getOrderID = (response, convo) => {
  convo.ask('Please enter your order ID', (response, convo) => {
    convo.say('Ok. Thanks for your information')
    convo.say('Your order details will be available soon')
    convo.say('NOTE: As details fetched from API call')
    convo.next()
  })
}

controller.hears(['order_history'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your order history will be displayed here (as retrieved from API call)')
      convo.say('Ex: You have 10 orders. 1 order in processing state')
    } else {
      convo.say(errMsg)
    }
    // convo.say('do you want further details yes/no')
  })
})

controller.hears(['order_appointment'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your order appointment details are XXXXXXX')
      convo.say('NOTE: As details fetched from API call')
    } else {
      convo.say(errMsg)
    }
    // convo.say('do you want further details yes/no')
  })
})

controller.hears(['order_package'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your package details are XXXXX')
      convo.say('NOTE: As details fetched from API call')
    } else {
      convo.say(errMsg)
    }
  })
})

controller.hears(['intro'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('I am your Bot Assitant. Here to answer your queries on your issue and orders. How can I help you')
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
