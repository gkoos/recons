(function() {
    var url = '{{serverUrl}}';
    
    var firstConnect = true;
    
    // get guid from url
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
    
    // stringify objects to JSON with methods
function sortci(a, b) {
    return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
}

// from jsconsole.com
function stringify(o, simple) {
    var json = '', i, type = ({}).toString.call(o), parts = [], names = [];

    if (type == '[object String]') {
        json = '"' + o.replace(/\n/g, '\\n').replace(/"/g, '\\"') + '"';
    } else if (type == '[object Array]') {
        json = '[';
        for (i = 0; i < o.length; i++) {
            parts.push(stringify(o[i], simple));
        }
        json += parts.join(', ') + ']';
        json;
    } else if (type == '[object Object]') {
        json = '{';
        for (i in o) {
            names.push(i);
        }
        names.sort(sortci);
        for (i = 0; i < names.length; i++) {
            parts.push(stringify(names[i]) + ': ' + stringify(o[names[i] ], simple));
        }
        json += parts.join(', ') + '}';
    } else if (type == '[object Number]') {
        json = o+'';
    } else if (type == '[object Boolean]') {
        json = o ? 'true' : 'false';
    } else if (type == '[object Function]') {
        json = o.toString();
    } else if (o === null) {
        json = 'null';
    } else if (o === undefined) {
        json = 'undefined';
    } else if (simple === undefined) {
        json = type + '{\n';
        for (i in o) {
            names.push(i);
        }
        names.sort(sortci);
        for (i = 0; i < names.length; i++) {
            parts.push(names[i] + ': ' + stringify(o[names[i]], true)); // safety from max stack
        }
        json += parts.join(',\n') + '\n}';
    } else {
        try {
            json = o+''; // should look like an object
        } catch (e) {}
    }
    return json;
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
            
            var text = stringify(data);
    
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
})();
