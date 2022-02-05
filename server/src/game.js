class Room {

    constructor(name) {
        this.name = name;
        this.players = [];
        this.grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        this.current = 0;  
    }

    get activePlayers() {
        return this.players;
    }

    joinPlayer(playerData) {
        if(this.players.some(player => player.username === playerData.username))
            return false;
        
        this.players.push(playerData);
        return true;
    }

    disconnectPlayer(socket) {
        this.players = this.players.filter((player) => player.socket !== socket);
    }

    play(socket, payload) {
        let piece = 2;
        if(this.players[0].socket === socket)
            piece = 1;
        this.grid[payload.line][payload.col] = piece;
        return this.grid;
    }

    get starter() {
        return this.players[this.current].username;
    }

    next() {
        this.current = (this.current + 1) % 2;
        return this.players[this.current].username;
    }

    getWinner() {
        let winner = -1;
        let grid = this.grid;
        if(grid[0][0] == grid[0][1] && grid[0][1] == grid[0][2]) winner = Math.max(winner, grid[0][0]);
        if(grid[1][0] == grid[1][1] && grid[1][1] == grid[1][2]) winner = Math.max(winner, grid[1][0]);
        if(grid[2][0] == grid[2][1] && grid[2][1] == grid[2][2]) winner = Math.max(winner, grid[2][0]);
        if(grid[0][0] == grid[1][0] && grid[1][0] == grid[2][0]) winner = Math.max(winner, grid[0][0]);
        if(grid[0][1] == grid[1][1] && grid[1][1] == grid[2][1]) winner = Math.max(winner, grid[0][1]);
        if(grid[0][2] == grid[1][2] && grid[1][2] == grid[2][2]) winner = Math.max(winner, grid[0][2]);
        if(grid[0][0] == grid[1][1] && grid[1][1] == grid[2][2]) winner = Math.max(winner, grid[0][0]);
        if(grid[0][2] == grid[1][1] && grid[1][1] == grid[2][0]) winner = Math.max(winner, grid[0][2]);

        let full = true;
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                if(!grid[i][j])
                    full = false;
            }
        }

        console.log(winner, full);
        return !full && winner > 0 ? this.players[winner-1].username : full ? 3 : -1;
    }

}

class Game {

    constructor() {
        this.rooms = {};
        this.sockets = {};
    }

    get activeRooms() {
        return this.rooms;
    }

    joinPlayer(playerData) {
        if(!(playerData.room in this.rooms))
            this.rooms[playerData.room] = new Room(playerData.room);
        let res = this.rooms[playerData.room].joinPlayer(playerData);
        if(res) {
            this.sockets[playerData.socket] = playerData.room;
            return  this.rooms[playerData.room].players.length;
        }
        return res;
    }

    disconnectPlayer(socket) {
        if(!(socket in this.sockets)) return;
        this.rooms[this.sockets[socket]].disconnectPlayer(socket);
        if(this.rooms[this.sockets[socket]].activePlayers.length == 0)
            delete this.rooms[this.sockets[socket]];
        delete this.sockets[socket];
    }

    play(socket, payload) {
        let grid = this.rooms[this.sockets[socket]].play(socket, payload);
        let winner = this.rooms[this.sockets[socket]].getWinner();
        
        return  {room: this.sockets[socket], grid: grid, next: this.rooms[this.sockets[socket]].next(), winner: winner};
    }

    getStarter(room) {
        return this.rooms[room].starter;
    }

}

export default function createGame() {
    return new Game();
}
