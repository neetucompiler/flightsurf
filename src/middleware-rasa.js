const request = require('request-promise')

module.exports = config => {
  if (!config) {
    config = {}
  }

  if (!config.rasa_uri) {
    config.rasa_uri = 'http://ubuntuvm.southcentralus.cloudapp.azure.com:5000'
  }

  var middleware = {
    receive: (bot, message, next) => {
      if (!message.text || message.is_echo || message.bot_id) {
        next()
        return
      }

      console.log('Sending message to Rasa: ' + message.text + ' via: ' + `${config.rasa_uri}/parse`)
      var options = {
        method: 'POST',
        uri: `${config.rasa_uri}/parse`,
        body: {
          q: message.text
        },
        json: true
      }
      request(options)
        .then(response => {
          console.log('Rasa response')
          console.log(response)
          message.intent = response.intent
          message.entities = response.entities
          message.confidence = response.intent.confidence
          next()
        })
    },
    hears: (patterns, message) => {
      return patterns.some(pattern => {
        console.log('pattern: ', pattern)
        console.log('message:', message)
        console.log('intent:', message.intent)
        console.log('intent name:', message.intent.name)
        if (message.intent.name === pattern) {
          console.log('Rasa intent matched hear pattern')
          console.log(message.intent)
          console.log(pattern)
          return true
        }
      })
    }
  }
  return middleware
}
