
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');
var events = require('events');
var util = require('util'); 
var app = express();



app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  //app.use(express.static(__dirname + '/public'));
  app.use(express.static(require('path').resolve(__dirname + "/public")));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/aboutus', routes.aboutus);
app.get('/room/:id/:r/:g/:b', routes.room);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", {baudrate : 57600});

serialPort.on("data", function (data) {
    console.log("here: "+data);
var data2= data;
});

/*

var util = require("util"), repl = require("repl");

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", {baudrate : 57600});

util.puts("write");

SerialPort.on("data", function(d){ 
    util.puts("here"); 
    util.puts(d); 
    serial_port.close(); 
});
*/

