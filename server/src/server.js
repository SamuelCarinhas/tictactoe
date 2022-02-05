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
    console.log(socket.id);
    socket.join('clientJoin');
    io.sockets.emit('clientJoin', game);

    socket.on('join_room', (playerData) => {
        playerData['socket'] = socket.id;
        let status = game.joinPlayer(playerData);
        if(!status) {
            socket.emit('wait', false);
        }
        else {
            console.log(`[LOG] Player ${playerData.username} joined room ${playerData.room}`);
            socket.emit('wait', true);
            io.sockets.emit('clientJoin', game);
        }
    });

    socket.on('disconnect', () => {
        game.disconnectPlayer(socket.id);
        console.log('DISCONNECTED');
    })
});

httpServer.listen(4000, () => {
    console.log('Server listening on port: 4000');
});
