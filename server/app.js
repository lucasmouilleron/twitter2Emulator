////////////////////////////////////////////////////////////////////////////////
// CONFIG
////////////////////////////////////////////////////////////////////////////////
var DEBUG = true;
var ROOM_ID = "default";
var COMMANDS_ACTIVATED = true;
var TWITTER_COMMANDS_ACTIVATED = true;
////////////////////////////////////////////////////////////////////////////////
var TWITTER_CONSUMER_KEY = "XF6D6C1dCWvf3WGOSM93vIuKw";
var TWITTER_CONSUMER_SECRET = "dBJFobdsuALJDA3wXqeNJx4QqeydPLmDp8JFNfSFaj0jjGpGxJ";
var TWITTER_ACCESS_TOKEN = "255388885-EXx08FKJ7qlRrLUYlXcFB97h7B14JmipDwpCX4ot";
var TWITTER_TOKEN_SECRET = "3LL2yrxqMFPB3Ll0YLw8uwo5Hd4s801Tx9A4m6i4LA5oF";
//var TWITTER_HASHTAG = "#testLucas";
var TWITTER_HASHTAG = "#apple";
//var TWITTER_HASHTAG = "#cdm2014";
////////////////////////////////////////////////////////////////////////////////
//var EMULATOR_APP_NAME = "TextEdit";
var EMULATOR_APP_NAME = "Snes9x";
var EMULATOR_COMMAND_DEFAULT_DURATION = 100;
var EMULATOR_BUTTONS = {a: "a", b : "b", x: "x", y : "y", up : "u", down : "d", left : "l", right : "r", start : "s", select : "f"};
//var EMULATOR_COMMANDS = {jump: "jump", left: "left", right: "right", up: "up", down: "down"}; // real
var EMULATOR_COMMANDS = {jump: "j", left: "l", right: "r", up: "u", down: "d"}; // test commands

////////////////////////////////////////////////////////////////////////////////
// INIT
////////////////////////////////////////////////////////////////////////////////
var colors = require("colors");
var python = require("node-python");
var pykeyboard = python.import("pykeyboard").PyKeyboard(); //https://github.com/SavinaRoja/PyUserInput
var sleep = require("sleep");
var applescript = require("applescript");
var twit = require("twit");
var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

////////////////////////////////////////////////////////////////////////////////
// INIT
////////////////////////////////////////////////////////////////////////////////
setupServer();
activateEmulator(setupTwitter);

////////////////////////////////////////////////////////////////////////////////
function setupServer() {
    server.listen(8080);

    app.get("/", function(req, res) {
        res.sendfile(__dirname + "/index.html");
    });

    io.sockets.on("connection", function(socket) {
        var username = "";
        socket.join(ROOM_ID);
        socket.emit("message", "welcome");

        socket.on("updateUsername", function(data) {
            username = data.username;
            socket.to(ROOM_ID).emit("message","new username "+username);
        });

        socket.on("sendToRoom", function(data) {
            var room = data.room;
            if (room == ROOM_ID) {
                processCommand(data.type);
            }
        });
    });
}

////////////////////////////////////////////////////////////////////////////////
function setupTwitter() {
    var twitter = new twit({consumer_key:TWITTER_CONSUMER_KEY, consumer_secret:TWITTER_CONSUMER_SECRET, access_token:TWITTER_ACCESS_TOKEN, access_token_secret:TWITTER_TOKEN_SECRET});
    var stream = twitter.stream("statuses/filter", { track: TWITTER_HASHTAG});
    stream.on("tweet", function (tweet) {
        if(TWITTER_COMMANDS_ACTIVATED) {
            if(DEBUG) info("tweet recieved : "+tweet.text);
            io.sockets.to(ROOM_ID).emit("tweet", {text: tweet.text, username: tweet.user.screen_name, picture: tweet.user.profile_image_url});
            processCommand(tweet.text);
        }
    });
}

////////////////////////////////////////////////////////////////////////////////
function processCommand(command) {
    if(COMMANDS_ACTIVATED) {
        if(DEBUG) info("processing command "+command);
        if(contains(command,EMULATOR_COMMANDS.up)) {
            pressKey(EMULATOR_BUTTONS.up);
        }
        if(contains(command,EMULATOR_COMMANDS.down)) {
            pressKey(EMULATOR_BUTTONS.down);
        }
        if(contains(command,EMULATOR_COMMANDS.left)) {
            pressKey(EMULATOR_BUTTONS.left);
        }
        if(contains(command,EMULATOR_COMMANDS.right)) {
            pressKey(EMULATOR_BUTTONS.right);
        }
        if(contains(command,EMULATOR_COMMANDS.jump)) {
            pressKey(EMULATOR_BUTTONS.a);
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
function activateEmulator(callback) {
    var asActivate = "tell application \""+EMULATOR_APP_NAME+"\" \nactivate\nend tell";
    applescript.execString(asActivate, function(err) {
        if (err)
        {
            error("error while activating", err);
        }
        else {
            sleep.sleep(1);
            info(EMULATOR_APP_NAME+" activated");
            // street figther 2 init infinit fight
            pressKeys([
                {key:EMULATOR_BUTTONS.start},
                {duration:1000},
                {key:EMULATOR_BUTTONS.start},
                {duration:1000},
                {key:EMULATOR_BUTTONS.down},
                {duration:1000},
                {key:EMULATOR_BUTTONS.down},
                {duration:1000},
                {key:EMULATOR_BUTTONS.down},
                {duration:1000},
                {key:EMULATOR_BUTTONS.down},
                {duration:1000},
                {key:EMULATOR_BUTTONS.down},
                {duration:1000},
                {key:EMULATOR_BUTTONS.start},
                {duration:2500},
                {key:EMULATOR_BUTTONS.down},
                {duration:1000},
                {key:EMULATOR_BUTTONS.right},
                {duration:1000},
                {key:EMULATOR_BUTTONS.start},
                {duration:2500},
                {key:EMULATOR_BUTTONS.start},
                {duration:1000},
                {key:EMULATOR_BUTTONS.start},
                {duration:1000},
                {key:EMULATOR_BUTTONS.down},
                {duration:1000},
                {key:EMULATOR_BUTTONS.start},
                {duration:2500},
                {key:EMULATOR_BUTTONS.a},
                {key:"p"},
                {duration:1000},
                {key:EMULATOR_BUTTONS.start},
                {duration:2500},
                {key:EMULATOR_BUTTONS.start}
                ], callback);
}
});
}

////////////////////////////////////////////////////////////////////////////////
function pressKey(key, duration) {
    pressKeys([{key:key,duration:duration}]);
}

////////////////////////////////////////////////////////////////////////////////
function pressKeys(keys, callback) {
    if(keys.length > 0) {
        keyItem = keys.shift();
        var key = keyItem.key;
        var sleep = key == null;
        var duration = keyItem.duration;
        if(duration == null) duration = EMULATOR_COMMAND_DEFAULT_DURATION;
        if(DEBUG && ! sleep) info("pressing key "+key+" for "+duration+"ms");
        if(DEBUG && sleep) info("waiting for "+duration+"ms");
        if(!sleep) pykeyboard.press_key(key);
        setTimeout(function(){
            if(!sleep)  pykeyboard.release_key(key);
            pressKeys(keys, callback);
        }, duration);
    }
    else {
        if(callback != null) callback();
    }
}

////////////////////////////////////////////////////////////////////////////////
function holdKey(key) {
    if(DEBUG) info("holding key "+key);
    pykeyboard.press_key(key);
}

////////////////////////////////////////////////////////////////////////////////
function releaseKey(key) {
    if(DEBUG) info("releasing key "+key);
    pykeyboard.release_key(key);
}

////////////////////////////////////////////////////////////////////////////////
function contains(message, needle) {
    return message.toUpperCase().indexOf(needle.toUpperCase()) > -1;
}

////////////////////////////////////////////////////////////////////////////////
function error(msg) {
    console.log(new Date().toISOString() + " [ERROR] : ".red + msg.red);
}

function success(msg) {
    console.log(new Date().toISOString() + "[SUCCESS] : ".green + msg.green);
}

function info(msg) {
    console.log(new Date().toISOString() + " [INFO] : ".blue + msg.blue);
}