var fs = require("fs");
var {spawn} = require("child_process");
var express = require("express");

var PORT = process.argv[2] || 8000;
var app = express();
var active = false;
var recorder;

function randomString(length) {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for ( var i = 0; i < length; i++ ) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function recorderMain() {
  process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf-8");
  process.stdin.resume();
  process.stdin.on("data",function(key) {
    if ( key == "c" ) {
      process.exit(0);
    } else if ( key == "i" ) {
      active = ! active;
      if ( active ) {
        recorder = spawn("sox",["-d",__dirname + "/recording.wav"]);
        console.log("Started recording...");
      } else {
        recorder.kill("SIGKILL");
        fs.writeFile(__dirname + "/record_id.txt",randomString(20),function(err) {
          if ( err ) throw err;
          console.log("Ended recording.");
        });
      }
    }
  });
}

app.get("/record_id.txt",function(request,response) {
  fs.readFile(__dirname + "/record_id.txt",function(err,data) {
    if ( err ) throw err;
    response.send(data);
  });
});

app.get("/recording.wav",function(request,response) {
  fs.readFile(__dirname + "/recording.wav",function(err,data) {
    if ( err ) throw err;
    response.send(data);
  });
});

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
  recorderMain();
});
