var serverUrl = 'https://demo-project-c9-gaborkoos.c9.io';
var version = '0.2.0';

var getGuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    }); 
}; // http://stackoverflow.com/a/2117523

var guid = getGuid(); guid = 'aaa';

var $cmd = document.getElementById('command');
var $console = document.getElementById('console');

document.getElementById('version').innerHTML = 'version ' + version;
document.getElementById('guid').innerHTML = 'guid = ' + guid;

function parseCommand(cmd) {
    cmd = cmd.trim();
    if (cmd) {
        if (cmd.charAt(0) === ':') {
            switch(cmd) {
                case ':guid':
                    return '\
This server listens on ' + guid + '.\n\
 You can watch console events if you include this script in your code:\n\
 &lt;script src=""&gt;&lt;/script&gt;\n\n';
                    break;
                case ':help':
                    return '\
Help - Available commands:\n\
 :help - displays this message\n\
 :guid - shows the guid the server listens to\n\
 :clear - clears display window\n\
 Everything not starting width : goes to your script\n\n';
                    break;
                case ':clear':
                    $console.innerHTML = '';
                    return '';
                default:
                    return 'Error: unknown command ' + cmd + '\n\n';
            }
        }
        else {
            socket.emit('command_to_server', {guid: guid, message: cmd});
            return '\
Sending command:\n\
 ' + cmd +'\n\n';
        }
    }
    else {
        return '';
    }
}


var socket = io.connect(serverUrl);

socket.on('connect', function(){
    document.getElementById('status').innerHTML = '<span class="green">Connected to server.</span>';
});

socket.on('message_to_client', function (data) {
    if (guid === data.guid) {
        $console.innerHTML += data.message+'\n\n';
    }
});

$cmd.onkeypress = function(e) {
    if((e.keyCode || e.which || e.charCode || 0) === 13) {
        var cmd = $cmd.value;
        $cmd.value = '';
        
        if (cmd) {
            $console.innerHTML += parseCommand(cmd);
            $console.scrollTop = $console.scrollHeight; // scroll down
        }
    }
};