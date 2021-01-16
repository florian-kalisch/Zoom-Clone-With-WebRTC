const { v4: uuidV4 } = require('uuid')
const express = require('express')
const app = express()
const fs = require('fs')
const https = require('https')
const options = {
  key:fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
}
const httpsServer = https.createServer(options, app)
const io = require('socket.io')(httpsServer)

var port = process.env.PORT || 80

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

httpsServer.listen(port, function () {
    console.log("Example app listening at https://%s:%s", httpsServer.address().address, httpsServer.address().port);
  });
