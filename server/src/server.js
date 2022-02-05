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

    socket.on('join_room', (playerData) => {
        playerData['socket'] = socket.id;
        let status = game.joinPlayer(playerData);
        if(!status)
            console.log('There is already a player with this name in this room');
        else
            console.log(`[LOG] Player ${playerData.username} joined room ${playerData.room}`);
    });

    socket.on('disconnect', () => {
        game.disconnectPlayer(socket.id);
        console.log('DISCONNECTED');
    })
});

httpServer.listen(4000, () => {
    console.log('Server listening on port: 4000');
});
