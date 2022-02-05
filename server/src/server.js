import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on('join_room', (data) => {
        socket.join(data);
        console.log('USER JOINED ROOM:', data);
    });
});

httpServer.listen(4000, () => {
    console.log('Server listening on port: 4000');
});
