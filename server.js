var http = require('http');
var path = require('path');
var fs   = require('fs');
var url  = require("url");
var sck  = require("socket.io");
var request = require("request");

// "template" variables
var tplVars = {
    version     : JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8')).version,
    serverUrl   : 'https://demo-project-c9-gaborkoos.c9.io', // add portnum if neccessary
};

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
        // substitute template vars with their values
        for (var varName in tplVars) {
            var regex = new RegExp('{{' + varName + '}}', 'g');
            data = data.replace(regex, tplVars[varName]);
        }

        // a terrible hack to merge socket.io.js and recons.js
        if (uri === '/recons.js') {
            request(tplVars.serverUrl + '/socket.io/socket.io.js', function(error, response, body) {
                res.writeHead(200, {'Content-Type': extensions[ext]});
                res.write(body + '\n' +data);
                res.end();
            });
        }
        else {
            res.writeHead(200, {'Content-Type': extensions[ext]});
            res.write(data);
            res.end();
        }
    });
}).listen(process.env.PORT, process.env.IP);

// listen to socket events
var io = sck.listen(app);
 
io.sockets.on('connection', function(socket) {
    socket.on('message_to_server', function(data) {
        io.sockets.emit("message_to_client", {guid: data.guid, message: data.message });
    });
    
    socket.on('command_to_server', function(data) {
        io.sockets.emit("command_to_client", {guid: data.guid, message: data.message });
    });
});