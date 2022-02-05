import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {

});

io.on('connection', (socket) => {
    console.log('Connected: ', socket.id);
});

httpServer.listen(3000, () => {
    console.log('Server listening on port: 3000');
});
