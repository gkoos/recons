var serverUrl = '{{serverUrl}}';

var consHistory = [];
var consHistoryPos = 1;

function guidText() {
    return '\
This server listens on ' + guid + '.\n\
 You can watch console events if you include this script in your code:\n\n\
&lt;!-- start of remote console code --&gt;\n\
&lt;script src="{{serverUrl}}/socket.io/socket.io.js"&gt;&lt;/script&gt;\n\
&lt;script src="{{serverUrl}}/recons.js?' + guid + '"&gt;&lt;/script&gt;\n\
&lt;!-- end of remote console code --&gt;\n\n';
}

// set caret to the end of textbox
function setCaretPositionToEnd(elem) {
    if(elem !== null) {
        var pos = elem.value.length;
        if(elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', pos);
            range.select();
        }
        else {
            if(elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(pos, pos);
            }
        }
    }
}

// generate random guid
// http://stackoverflow.com/a/2117523
function getGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    }); 
}

// set guid
var guid = window.location.search.substring(1);
if (!guid) {
    guid = getGuid();
}
document.getElementById('guid').innerHTML = 'guid = ' + guid;

var $cmd = document.getElementById('command');
var $console = document.getElementById('console');

function parseLocalCommand(cmd) {
    var parsed = {};
    var pos = cmd.indexOf(" ");
    
    if (pos == -1) {
        parsed = {command: cmd, param1: '', param2: ''};
    }
    else {
        parsed.command = cmd.substr(0, pos);
        var params = cmd.substr(pos + 1);
        pos = params.indexOf(" ");
        if (pos == -1) {
            parsed.param1 = params;
            parsed.param2 = '';
        }
        else {
            parsed.param1 = params.substr(0, pos);
            parsed.param2 = params.substr(pos + 1);
        }
    }

    return parsed;
}

function parseCommand(cmd) {
    cmd = cmd.trim();
    if (cmd) {
        if (cmd !== consHistory[consHistoryPos-1]) {
            consHistory.push(cmd);
            consHistoryPos = consHistory.length;
        }
        
        if (cmd.charAt(0) === ':') { // it is a local command
            cmd = parseLocalCommand(cmd);
            var output = '';
            switch(cmd.command) {
                case ':history':
                    output = 'Local history:\n\n';
                    for (var i=0; i<consHistory.length; i++) {
                        output += consHistory[i] + '\n\n';
                    }
                    break;
                case ':guid':
                    if (cmd.param1) {
                        guid = cmd.param1 === 'new' ? getGuid() : cmd.param1;
                        document.getElementById('guid').innerHTML = 'guid = ' + guid;
                    }
                    output = guidText();
                    break;
                case ':help':
                    output = '\
Help - Available commands:\n\
 :help - displays this message\n\
 :guid - shows the guid the server listens to\n\
 :guid new - generates a new guid\n\
 :guid <id> - sets the guid to <id>, eg. :guid partytime-aaed-08a5\n\
 :clear - clears display window\n\
 :history - display history of local commands\n\
 Everything not starting width : goes to your application\n\n';
                    break;
                case ':clear':
                    $console.innerHTML = '';
                    output = '';
                    break;
                default:
                    output = 'Error: unknown command ' + cmd + '\n\n';
            }
            
            return output;
        }
        else { // remote command: send to the server
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
    $console.innerHTML += guidText();
    $console.scrollTop = $console.scrollHeight; // scroll down
});

socket.on('message_to_client', function (data) {
    if (guid === data.guid) {
        var output = data.level === 'log' ? '' : '<span class="' + data.level + '">' + data.level + ':</span>\n';
        $console.innerHTML += output + data.message+'\n\n';
        $console.scrollTop = $console.scrollHeight; // scroll down
    }
});

$cmd.onkeydown = function(e) {
    var code = e.keyCode || e.which || e.charCode || 0;
    var hcmd;
    switch(code) {
        case 13: // enter
            var cmd = $cmd.value;
            $cmd.value = '';

            if (cmd) {
                var msg = parseCommand(cmd);
                $console.innerHTML += msg;
                $console.scrollTop = $console.scrollHeight; // scroll down
            }
            break;
        case 38: // up arrow
            if (consHistoryPos) {
                consHistoryPos--;
                hcmd = consHistory[consHistoryPos];
                $cmd.value = hcmd;
                setCaretPositionToEnd($cmd);
            }
            break;
        case 40: // down arrow
            if(consHistoryPos < consHistory.length - 1) {
                consHistoryPos++;
                hcmd = consHistory[consHistoryPos];
            }
            else {
                if (consHistoryPos === consHistory.length - 1) {
                    consHistoryPos++;
                }
                hcmd = '';
            }
            $cmd.value = hcmd;
            setCaretPositionToEnd($cmd);
            break;
    }
};