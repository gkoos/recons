var url = '{{serverUrl}}';

var firstConnect = true;

function getGuid() {
    var scripts = document.getElementsByTagName('script');
    var remoteScript;
    
    for (var i = 0; i < scripts.length; i++) {
        if (/recons.js\?/.test(scripts[i].src)) {
            remoteScript = scripts[i];
            break;
        }
    }

    return remoteScript.getAttribute('src').replace(/.*\?/, '');
}

var guid = getGuid();

var socket = io.connect(url);
socket.on('connect', function() {
    if (firstConnect) {
        alert("Connected to recons remote console!");
        firstConnect = false;
    }
});

socket.on('command_to_client', function(data) {
    eval(data.message);
});

var newConsoleMethod = function(oldConsoleLog, level) {
    return function(data) {
        if (oldConsoleLog !== undefined) {
            oldConsoleLog.call(console, data);
        }
        
        var text = JSON.stringify(data);

        socket.emit('message_to_server', {guid: guid, message: text, level: level});
    };
};

if (!window.console) {
    window.console = {};
}

console.log = newConsoleMethod(console.log, 'log');
console.info = newConsoleMethod(console.info, 'info');
console.debug = newConsoleMethod(console.debug, 'debug');
console.warn = newConsoleMethod(console.warn, 'warn');
console.error = newConsoleMethod(console.error, 'error');
