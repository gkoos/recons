var http = require('http');
var path = require('path');
var fs   = require('fs');
var url  = require("url");

// connected clients (apps and consoles)
var clients = {app: {}, console: {}};

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

function corsHeaders() {
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    return headers;
}

var app = http.createServer(function (req, res) {
    var status = 200;
    var uri = url.parse(req.url).pathname;
    if (uri === '/') uri = '/console.html';
    var fn = __dirname + '/public' + uri;
    var ext = path.extname(fn);
    var tmp, type, guid;
    
    tmp = uri.split('/');
    if (uri.slice(0, 5) == '/msg/') {
        // message sent to app or console
        type = tmp[2];
        guid = tmp[3];
        
        var data = '';
        req.on('data', function(chunk) {
            data += chunk;
        });
        
        req.on('end', function() {
            var headers = corsHeaders();
            if (req.method === 'OPTIONS') {
                res.writeHead(200, headers);
                res.end();
            }
            else if (req.method === 'POST') {
                // response: ok
                headers['Content-Type'] = 'text/html';
                res.writeHead(200, "OK", headers);
                res.end('Ok');

                // broadcast data to listening clients
                if (clients[type][guid]) {
                    var tmp = clients[type][guid].length;
                    for (var i=0; i<tmp; i++) {
                        data = 'data: ' + data.replace('\n', '\ndata: ') + '\n\n';
                        clients[type][guid][i].write(data);
                    }
                }
            }
        });
    }
    else if (uri.slice(0, 5) == '/sse/') {
        // listen to server sent events
        type = tmp[2];
        guid = tmp[3];
        
        req.socket.setTimeout(Infinity);
        res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
        });
        res.write('\n');
        
        // attach to connected clients
        if (clients[type][guid]) {
            clients[type][guid].push(res);
        }
        else {
            clients[type][guid] = [res];
        }
        
        console.log('New sse listener: ' + type + ', guid= ' + guid);
        
        tmp = clients[type][guid].length;
        req.on("close", function(){
            delete clients[type][guid][tmp];
            console.log("SSE listener detached: " + type + ', guid= ' + guid);
        });
    }
    else {
        // serving static content
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
    }
}).listen(process.env.PORT, process.env.IP);