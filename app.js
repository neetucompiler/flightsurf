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
      convo.say('Hello, Welcome! I am PLM bot. How can I help you ?')
    } else {
      convo.say(errMsg)
    }
  })
})

controller.hears(['issue'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, askProductName)
})

var askProductName = (response, convo) => {
  convo.ask('What is the product name?', (response, convo) => {
    convo.say('Awesome.')
    askProductVariant(response, convo)
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

controller.hears(['issue_fault'], 'message_received, direct_message, direct_mention, mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, askProductName)
})

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
controller.hears(['order_status'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your order status will be displayed here (once retrieved from API call)')
      convo.say('Ex: Your present Order with OrderId ABCD1234 is in process, expected to be completed on DD-MM-YYYY')
    } else {
      convo.say(errMsg)
    }
  })
})

controller.hears(['order_details'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your order status will be displayed here (once retrieved from API call)')
      convo.say('Ex: Your present Order with OrderId ABCD1234 is in process, expected to be completed on DD-MM-YYYY')
    } else {
      convo.say(errMsg)
    }
  })
})

controller.hears(['issue_complaint'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Issue complaint flow will be designed as per the requirement')
    } else {
      convo.say(errMsg)
    }
    // convo.say('do you want further details yes/no')
  })
})

controller.hears(['order_track'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your order tracking details will be displayed here as the design')
    } else {
      convo.say(errMsg)
    }
    // convo.say('do you want further details yes/no')
  })
})

controller.hears(['order_history'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your order history will be displayed here (once retrieved from API call)')
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
      convo.say('Your order appointment details will be displayed here (once retrieved from API call)')
    } else {
      convo.say(errMsg)
    }
    // convo.say('do you want further details yes/no')
  })
})

controller.hears(['appointment'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your order appointment details will be displayed (once retrieved from API calls)')
    } else {
      convo.say(errMsg)
    }
    // convo.say('do you want further details yes/no')
  })
})

controller.hears(['order_pacakage'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Your package details are displayed from backend API')
    } else {
      convo.say(errMsg)
    }
  })
})

controller.hears(['discontinue'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Okay thanks for your time. Will get back to you')
      convo.say('Bye! Have a nice day')
    } else {
      convo.say(errMsg)
    }
  })
})

controller.hears(['continue'], 'message_received,direct_message,direct_mention,mention', rasa.hears, (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      throw err
    }
    if (confiCheck(message, 0.5)) {
      convo.say('Okay! You can ask me your queries related to Issue/ Order/ Appointments')
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
      convo.say('I am PLM assistance here to answer your queries on Issues/Orders/Appointments .You can proceed with your queries ')
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
