
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes'),mongoose = require('mongoose');
 // , db = mongoose.connect('mongodb://localhost/expressdb');


var app = module.exports = express.createServer();

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyO1", {baudrate : 57600});
var  byteArray = new Array(3);
   byteArray[0] = 250;
   byteArray[1] = 250;
   byteArray[2] = 0;
   byteArray[3] = 0x69;
var address1 = 4;


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/nodetube', function(req, res){
   //Tell the request that we want to fetch youtube.com, send the results to a callback function
        request({uri: 'http://youtube.com'}, function(err, response, body){
                var self = this;
      self.items = new Array();//I feel like I want to save my results in an array
       
      //Just a basic error check
                if(err && response.statusCode !== 200){console.log('Request error.');}
                //Send the body param as the HTML code we will parse in jsdom
      //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
      jsdom.env({
                        html: body,
                        scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                }, function(err, window){
         //Use jQuery just as in a regular HTML page
                        var $ = window.jQuery;
                         
                        console.log($('title').text());
                        res.end($('title').text());
                });
        });
});



app.listen(80, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

setInterval(function() {
       console.log("valeurs:");
     serialPort.write("blabla");
      serialPort.write(byteArray[0]);
      serialPort.write(byteArray[1]);
     serialPort.write(byteArray[2]);
     // serialPort.write(byteArray[3]); 
      serialPort.write(address1);  






}, 2000);

serialPort.on("data", function (data) {
   console.log("data: "+data);
});





app.get('/', function(req, res){
  res.render('about', {
    title: 'About'
  });
});

app.get('/', function(req, res){
  res.render('contact', {
    title: 'Contact'
  });
});

