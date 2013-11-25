var http = require('http');
var path = require('path');
var fs   = require('fs');
var url  = require("url");
var sck  = require("socket.io");

// mime types for static content
var extensions = {
".html": "text/html",
".css": "text/css",
".js": "application/javascript",
".png": "image/png",
".gif": "image/gif",
".jpg": "image/jpeg"
};

// serving static content
var app = http.createServer(function (req, res) {
    var uri = url.parse(req.url).pathname;
    if (uri === '/') uri = '/console.html';
    var fn = __dirname + uri;
    var ext = path.extname(fn);
    
    fs.readFile(__dirname + uri, 'utf-8', function (error, data) {
        res.writeHead(200, {'Content-Type': extensions[ext]});
        res.write(data);
        res.end();
    });
}).listen(process.env.PORT, process.env.IP);

var io = sck.listen(app);
 
io.sockets.on('connection', function(socket) {
    socket.on('message_to_server', function(data) {console.log('message_to_server'); console.log(data);
        io.sockets.emit("message_to_client", {guid: data.guid, message: data.message });
    });
    
    socket.on('command_to_server', function(data) {
        io.sockets.emit("command_to_client", {guid: data.guid, message: data.message });
    });
});