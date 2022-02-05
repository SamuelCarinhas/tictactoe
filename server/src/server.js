import { createServer } from 'http';
import { Server } from 'socket.io';
import createGame from './game.js';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

const game = new createGame();

io.on('connection', (socket) => {
    socket.join('clientJoin');
    io.sockets.emit('clientJoin', game);

    socket.on('join_room', (playerData) => {
        playerData['socket'] = socket.id;
        let status = game.joinPlayer(playerData);
        console.log(status);
        if(!status) {
            socket.emit('wait', false);
        }
        else {
            socket.join(playerData.room);
            console.log(`[LOG] Player ${playerData.username} joined room ${playerData.room}`);
            socket.emit('wait', true);
            io.sockets.emit('clientJoin', game);
            if(status == 2) {
                console.log('EMIT', game.getStarter(playerData.room));
                io.to(playerData.room).emit('start', game.getStarter(playerData.room));
            }
        }
    });

    socket.on('play', (payload) => {
        let data = game.play(socket.id, payload);

        io.to(data.room).emit('play', data.grid, data.next);
        if(data.winner != -1) {
            io.to(data.room).emit('win', data.winner);
        }
    })

    socket.on('disconnect', () => {
        game.disconnectPlayer(socket.id);
    })
});

httpServer.listen(4000, () => {
    console.log('Server listening on port: 4000');
});
