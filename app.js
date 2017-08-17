// BOTKIT LIBRARY
const path = require('path')
const WebBot = require(path.join(__dirname, './lib/WebBot.js'))

const express = require('express')
const app = express()
const http = require('http').Server(app)

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile('public/index.html', {
    root: __dirname
  })
})

app.set('port', process.env.port || process.env.PORT || 62000)
http.listen(app.get('port'), () => {
  console.log(`listening on *:${app.get('port')}`)
})
