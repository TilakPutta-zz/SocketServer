var shortID = require('shortid')

module.exports = class Player {
    constructor() {
        this.name = '';
        this.id = shortID.generate();
        this.playerNumber = null;
        this.roomno = null;
    }
}