var io = require('socket.io')(process.env.PORT || 52300)

console.log("Server has started")

var Player = require('./Classes/Player')
var Room = require('./Classes/Room')
var rooms = {};
var  players = [];
var sockets = [];
io.on('connection', function(socket) {
    console.log("Connection Made!")

    var player = new Player();
    players[player.id] = player;
    sockets[player.id] = socket;

    socket.emit('register', {id: player.id, playerNumber: player.playerNumber})
    socket.emit('connected', player)
    socket.broadcast.emit('connected', player)

    for (var playerID in players) {
        if (playerID != player.id) {
            socket.emit('connected', players[playerID])
        }
    }

    socket.on('createroom', function(data) {
        var roomno = Math.floor(1000 + Math.random() * 9000);
        player.roomno = roomno;
        var room = new Room(roomno, data.numberOfPlayers);
        rooms[roomno] = room
        try {
            socket.join(roomno)
            var playersInRoom = Object.keys(rooms[roomno].players).length;
            player.playerNumber = playersInRoom + 1;
            var data = "NUMP|"+rooms[roomno].numberOfPlayers+"|"+player.playerNumber+"!"+"SWHO|"
            rooms[roomno].players.forEach(p => {
                data += p.name + "|";
            });
            rooms[roomno].players[player.id] = player
            rooms[roomno].sockets[player.id] = socket
            io.to(socket.id).emit('joined', {roomno: roomno})
            io.to(socket.id).emit('data', {data})
            console.log("room has created: "+ roomno)
        } catch (error) {
            console.log(error)
        }
        
    })

    socket.on('joinRoom', function(data) {
        var roomno = data.roomno
        player.roomno = roomno
        console.log("player joined room: "+roomno)
        socket.join(roomno)
        var playersInRoom = Object.keys(rooms[roomno].players).length;
        player.playerNumber = playersInRoom + 1;
        var data = "NUMP|"+rooms[roomno].numberOfPlayers+"|"+player.playerNumber+"!"+"SWHO|"
        for (var p in rooms[roomno].players) {
            data += p.name + "|";
        }
        rooms[roomno].players[player.id] = player
        rooms[roomno].sockets[player.id] = socket
        io.to(socket.id).emit('data', {data})
    })

    socket.on('data', function(data) {
        var roomno = String(data['room']);
        var message = String(data['data']);
        var aData = message.split('|');
        var Broadcast = function(msg) {
            io.sockets.in(roomno).emit('data', {data: msg});
        }
        switch (aData[0])
        {
            case "CWHO":
                clientName = aData[1];
                playerNumber = parseInt(aData[2]);
                Broadcast("SCNN|" + clientName);
                break;
            case "C_SEL_PEG":
                Broadcast(message.replace('C', 'S'));
                break;
            case "C_MOV_PEG":
                Broadcast(message.replace('C', 'S'));
                break;
            case "C_DONE_MOV":
                Broadcast(message.replace('C', 'S'));
                break;
            case "C_CANCEL_MOV":
                Broadcast(message.replace("C_CANCEL_MOV", "S_CANCEL_MOV"));
                break;
        }
    })

    socket.on('disconnect', function() {
        console.log('A player has disconnected')
        delete rooms[player.roomno].players[player.id];
        delete rooms[player.roomno].sockets[player.id];
        delete players[player.id];
        delete sockets[player.id];
    })
})