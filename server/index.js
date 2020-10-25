const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUserInRoom } = require('./users')

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();

const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('We have a new connection');

    socket.on('join', ({name, room}, callBack) => {
        const { error, user } = addUser({ id: socket.id});
        
        if(error) return callBack(error)

        socket.emit('message', { user: 'admin', text: ` ${user.name}, 'welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name}, has join`});

        socket.join(user.room);

        callBack();
    });

    socket.on('sendMessage', (message, callBack) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user: user.name, test: message})

        callBack();
    })

    socket.on('disconnect', () => {
        console.log('user has left!!!')
    })
})

app.use(router)

server.listen(PORT, () => console.log(`server runing at port ${PORT}`));