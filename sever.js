var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var letters = "ABCDEFGHIJKLMNOPQRST";
var letter = "A";

var users = {};
var name_increment = 1;

io.on('connection', function(socket){
    console.log('a user connected. Socked id ' + socket.id);

    var user = {
        id: socket.id,
        name: "Guest_" + name_increment++
    }
    console.log(user);
    users[socket.id] = user;
    socket.emit('user name', user.name);
    io.emit('new user', users);

    socket.on('disconnect', function() {
        console.log('user disconnected');

        delete users[socket.id];
        io.emit('new user', users);
    });

    socket.on('start game', function(msg) {
        console.log('game started');
        
        var letter = letters[Math.round(Math.random() * 20)];
        io.emit('start game', letter);
    });

    var timeout = 10;
    var timeoutInterval;

    function timeOutCounter() {
        if(timeout) {
            io.emit('timeout counter', timeout);
            timeout--;
        } else {
            clearInterval(timeoutInterval);
        }
    }

    socket.on('submit', function(result) {
        console.log('game submitted');

        users[socket.id].result = result;

        timeOutCounter();
        timeoutInterval = setInterval(timeOutCounter, 1000);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});