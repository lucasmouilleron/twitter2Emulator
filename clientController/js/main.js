////////////////////////////////////////////////////////////////////////////////
// CONFIG
////////////////////////////////////////////////////////////////////////////////
//var SOCKET_URL = "http://testwebsocket.eu01.aws.af.cm";
//var SOCKET_PORT = 80;
//var SOCKET_URL = "http://localhost";
//var SOCKET_URL = "http://169.254.233.169";
//var SOCKET_URL = "http://lucas.haveidols.com";
//var SOCKET_URL = "http://test-node-10405.euw1.actionbox.io"
//var SOCKET_URL = "http://localhost"
//var SOCKET_URL = "http://192.168.0.1"
var SOCKET_URL = "http://10.196.197.90"
var SOCKET_PORT = 8080;
var ROOM_ID = "default";
////////////////////////////////////////////////////////////////////////////////
var EMULATOR_COMMANDS = {jump: "jump", left: "left", right: "right", up: "up", down: "down"};

////////////////////////////////////////////////////////////////////////////////
// GLOBAL
////////////////////////////////////////////////////////////////////////////////
var socket;
var mode = null;
var lastOrientationSent = 0;
var lastMotionSent = 0;
var lastPositionSent = 0;
var lastBuzzerSent = 0;
var username = "anonyme_"+Math.round(new Date().getTime()/1000);

////////////////////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////////////////////
$(function() {
    $("#username").val(username);
    initSocket();
    displayMainLoader();
});

////////////////////////////////////////////////////////////////////////////////
function initSocket() {
    socket = io.connect(SOCKET_URL + ":" + SOCKET_PORT);
    socket.on("connect", function() {
        sendServer("updateUsername",{username: username});
        setupControls();
        hideMainLoader();
    });

    socket.on("message", function(data) {
        $("#message").html(new Date()+" "+data);
    });

    socket.on("tweet", function(data) {
        $("#message").html("<img src='"+data.picture+"'/>"+ new Date()+" / @"+data.username+" > "+data.text);
    });
}

////////////////////////////////////////////////////////////////////////////////
function sendServer(type, content) {
    socket.emit(type, content);
}

////////////////////////////////////////////////////////////////////////////////
function sendToRoom(roomID, type, content) {
    socket.emit("sendToRoom", {room: roomID, username: username, type: type, content: content});
}

////////////////////////////////////////////////////////////////////////////////
function setupControls() {
    $("#controls").fadeIn();
    
    $("#simpleSend").click(function() {
        sendToRoom(roomID, "MESSAGE", {
            note: "yeah !!!", date: new Date().getTime()
        });
    });

    $("#updateUsername").click(function() {
        username = $("#username").val();
        sendServer("updateUsername",{username: username});
    });

    $("#up").hammer().on("tap", function() {
        sendToRoom(ROOM_ID,EMULATOR_COMMANDS.up);
    });
    $("#down").hammer().on("tap", function() {
        sendToRoom(ROOM_ID,EMULATOR_COMMANDS.down);
    });
    $("#left").hammer().on("tap", function() {
        sendToRoom(ROOM_ID,EMULATOR_COMMANDS.left);
    });
    $("#right").hammer().on("tap", function() {
        sendToRoom(ROOM_ID,EMULATOR_COMMANDS.right);
    });
    $("#jump").hammer().on("tap", function() {
        sendToRoom(ROOM_ID,EMULATOR_COMMANDS.jump);
    });
}

////////////////////////////////////////////////////////////////////////////////
function log(message) {
    $("#message").html(new Date()+" : "+message);
}