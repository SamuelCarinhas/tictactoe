class Room {

    constructor(name) {
        this.name = name;
        this.players = [];
    }

    get activePlayers() {
        return this.players;
    }

    joinPlayer(playerData) {
        if(this.players.some(player => player.username == playerData.username))
            return false;
        
        this.players.push(playerData);
        return true;
    }

    disconnectPlayer(socket) {
        this.players = this.players.filter((player) => player.socket !== socket);
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
        if(res)
            this.sockets[playerData.socket] = playerData.room;
        return res;
    }

    disconnectPlayer(socket) {
        if(!(socket in this.sockets)) return;
        this.rooms[this.sockets[socket]].disconnectPlayer(socket);
        if(this.rooms[this.sockets[socket]].activePlayers.length == 0)
            delete this.rooms[this.sockets[socket]];
        delete this.sockets[socket];
    }

}

export default function createGame() {
    return new Game();
}
