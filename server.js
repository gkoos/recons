var http = require("http");
var url = require("url");
var qs = require("querystring");
var fs = require('fs');
var async = require('async');

var html;
var css;

var message = 'Console...';

async.parallel([
    function (callback) {fs.readFile(__dirname + '/console.html',function (err, data){html=data;})},
    function (callback) {fs.readFile(__dirname + '/console.css',function (err, data){css=data;})}
], function(callback) {
    // create server
    http.createServer(function(req, res) {
        var uri = url.parse(req.url).pathname;
        
        switch(uri) {
            case '/cors':
                if (req.method.toUpperCase() === "OPTIONS"){
                     res.writeHead(
                        "204",
                        "No Content",
                        {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                            "Access-Control-Allow-Headers": "Content-Type, Accept",
                            "Access-Control-Max-Age": 10, // seconds
                            "Content-Length": 0
                        }
                    );
                    res.end();
                }
                else if(req.method.toUpperCase() === "POST"){
                    var body='';
                    req.on('data', function (data) {
                        body += data;
                    });
                    req.on('end',function(){
                        var POST =  qs.parse(body);
                        message = POST.data;
                        console.log("guid ="+POST.guid);
            
                        res.writeHead(
                            "200",
                            "OK",
                            {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "text/plain",
                                "Content-Length": 1
                            }
                        );
                        res.end('1');
                    });
                }
                else {
                    res.end("0");
                }
                break;
            case '/stream':
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                });
                    
                setInterval(function(){
                    if (message) {
                        var id = (new Date()).toLocaleTimeString();
                                    
                        res.write('id: ' + id + '\n');
                        res.write("data: " + message + '\n\n');
                        
                        message = '';
                    }
                }, 1000);
                break;
            case '/console.html':
                res.end(html);
                break;
            case '/console.css':
                res.end(css);
                break;
            default:
                res.end("Hello world from Cloud9! " + uri);
        }
    }).listen(process.env.PORT, process.env.IP);
    
    console.log('Remote Console started');
});