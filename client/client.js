var fs = require("fs");
var {spawn} = require("child_process");
var request = require("request");

var ADDRESS = process.argv[2] || "http://10.0.1.96:9876";
var activeID = "";

function playMessage() {
  console.log("New message retrieved");
  request(ADDRESS + "/recording.wav",{encoding:"binary"},function(err,meh,body) {
    if ( err ) throw err;
    fs.writeFile(__dirname + "/recording.wav",body,"binary",function(err) {
      if ( err ) throw err;
      var player = spawn("play",[__dirname + "/recording.wav"]);
    });
  });
}

function checkNewMessage() {
  request(ADDRESS + "/record_id.txt",function(err,meh,body) {
    if ( err ) {
      if ( err.code == "ECONNREFUSED" ) {
        console.log("Server went offline! Aborted.");
        process.exit(1);
      } else {
        console.log(err);
      }
    }
    if ( activeID != body ) {
      if ( activeID != "" ) playMessage();
      activeID = body;
    }
  });
}

setInterval(checkNewMessage,7500);
