var http = require('http');
var path = require('path');
var fs   = require('fs');
var url  = require("url");
var sck  = require("socket.io");

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
    var status = 200;
    var uri = url.parse(req.url).pathname;
    if (uri === '/') uri = '/console.html';
    var fn = __dirname + '/public' + uri;
    var ext = path.extname(fn);

    fs.readFile(fn, 'utf-8', function (error, data) {
        if (!data) {
            status = 404; // handling not found
            data = '404 - page not found';
        }
        else {
            // substitute template vars with their values
            for (var varName in tplVars) {
                var regex = new RegExp('{{' + varName + '}}', 'g');
                data = data.replace(regex, tplVars[varName]);
            }
        }
        
        res.writeHead(status, {'Content-Type': extensions[ext]});
        res.write(data);
        res.end();
    });
}).listen(process.env.PORT, process.env.IP);

// listen to socket events
var io = sck.listen(app);
 
io.sockets.on('connection', function(socket) {
    socket.on('message_to_server', function(data) {
        io.sockets.emit("message_to_client", {guid: data.guid, message: data.message, level: data.level });
    });
    
    socket.on('command_to_server', function(data) {
        io.sockets.emit("command_to_client", {guid: data.guid, message: data.message });
    });
});