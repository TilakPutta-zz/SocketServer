
module.exports = class Room {
    constructor(roomno, numberOfPlayers) {
        this.roomno = roomno
        this.numberOfPlayers = numberOfPlayers;
        this.players = [];
        this.sockets = [];
    }
}