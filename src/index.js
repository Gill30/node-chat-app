const express = require('express')
const path = require('path')
const http = require('http')
const socketio =require('socket.io')
const Filter = require("bad-words")
const { genereateMessage, genereateLocationMessage } = require('./utils/messages')
const { getUsersInRoom, getUser, addduser, removeUser} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket)=>{
  console.log('New Web socket Connection')
//   socket.emit('message', genereateMessage('Welcome!'))  
//   socket.broadcast.emit('message', genereateMessage("A new user has joined in!"))

  socket.on("join", (options, callback)=>{
    const {error, user} =addduser({
        id : socket.id,
        ...options
    })

    if(error){
        return callback(error)
    }

    socket.join(user.room)
    
    socket.emit('message', genereateMessage("Admin", 'Welcome!'))  
    socket.broadcast.to(user.room).emit('message', genereateMessage("Admin", `${user.username}  has joined in!`))
    io.to(user.room).emit("roomData", {
        room : user.room, 
        users : getUsersInRoom(user.room)
    })
    callback()
    //io.to.emit, socket.broadcast.to.emit
    // io.emit('message', genereateMessage("User has left!"))
  })

  socket.on('sendMessage', (message, callback)=>{
    const user = getUser(socket.id)  
    const filter = new Filter()

      if(filter.isProfane(message)){
          return callback("Profanity is not allowed")
      }

      io.to(user.room).emit('message', genereateMessage(user.username, message))  
      callback()
  })

  socket.on("sendLocation", (coords ,callback) =>{
    const user = getUser(socket.id)  
    io.to(user.room).emit('locationMessage', genereateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })

  socket.on("disconnect", ()=>{
    const  user = removeUser(socket.id)
    if(user){
        io.to(user.room).emit('message', genereateMessage("Admin", `${user.username} has left!`))
        io.to(user.room).emit("roomData", {
            room : user.room, 
            users : getUsersInRoom(user.room)
        })
    }
    
  })
})



server.listen(port, ()=>{
    console.log(`Server is up on the port ${port}`)
})
