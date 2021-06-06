const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/message')
const {userJoin, getCurrentUser,getRoomUsers,
    userLeave} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatChord Bot';

// Run when client connects
io.on('connection', socket=>{
    socket.on('joinRoom', ({username, room})=>{

        const user = userJoin(socket.id, username, room)

        socket.join(room)

        socket.emit('message', formatMessage(botName, 'Welcome to ChatChord!')) //emits message to single user 

        // Broadcast when a user connects 
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${username} joined the chat`)); //emits to all except the joinee

        //  send user and room info 
        io.to(user.room).emit('roomUsers', {
            room:user.room,
            users: getRoomUsers(user.room)
        })
    })

    // LIsten for chatMessage 
    socket.on('chatMessage', (msg)=>{

        const user = getCurrentUser(socket.id)
        // console.log(msg)
        io.to(user.room).emit('message', formatMessage( user.username, msg))
    });

    // Runs when a user disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers', {
                room:user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
    
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
