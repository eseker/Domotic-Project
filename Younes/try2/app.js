
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http');
var events = require('events');
var util = require('util'); 
var app = express();
var _ = require('underscore');




var data =
{
  rooms : ["Salle &agrave; manger", "Salon"],
  devices : [ 
            {id: 4, sensor: false, name : "Lampe central", room: 0, interruptor:true, color:"#000000"},
            {id: 12, sensor: true, name : "Capteur IR", room: 0, lights: [{id: 4, name : "Lampe 1"}], startTime: 540, endTime:1020, duration:5 , color:"#000000", light:4},
  				  {id: 21, sensor: false, name : "Lampe central", room: 1,  interruptor:true, color:"#000000"},
            {id: 22, sensor: true, name : "Capteur IR", room: 1, lights: [{id: 5, name : "Lampe 2"}], startTime: 540, endTime:1020, duration: 10, color:"#000000", light:5 },
            {id: 23, sensor: false, name : "entr&eacutee", room: 1, interruptor:true, color:"#000000"}
            ]
}


            
app.configure(function(){
  app.set('port', process.env.PORT || 3003);
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

app.get('/', function(req, res){
  res.render('index', { title: 'App Domotique' });
});

app.get('/aboutus', function(req, res){
  res.render('aboutus', { title: 'About us' });
});

app.get('/settings', function(req, res){
    res.send(data);
});

app.post('/settings', function(req, res){
    
    
    console.log(req.body.data)
    data.devices = req.body.data;
    
    res.send(true);
});

app.post('/send', function(req, res){
  var devise = req.body;
  /*
      send request via serial port here
      
      available properties for light :
      - id, color(hex), interruptor(boolean)
      
      available properties for sensor :
      - startTime(minute), endTime(minute), duration(seconde), color(hex), light
      
      var message =[];
      message[0]= devise.id.toString(16);
      message[1]= devise.color.toString(16);
      serialPort.write(message);
  */
  res.send("ok");
  
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



var interval = setInterval(function() {
  var now = new Date;
  var hour = now.getHours();
  var minute = now.getMinutes();
  var sminutes, shours, eminutes, ehours
  
  var sensors = _.filter(data.devices, function(d){ return d.sensor == true; });
  _.each(sensors, function(sensor)
  { 
   	sminutes = parseInt(sensors.startTime % 60, 10),
		shours = parseInt(sensors.startTime / 60 % 24, 10),
    eminutes= parseInt(sensors.endTime % 60, 10),
    ehours = parseInt(sensors.endTime / 60 % 24, 10),
    
    if (hour == shours && minute == sminutes && sensor.running == false) {
      // TODO start listening the sensor here
      sensor.running = true;
    }else if(hour == ehours && minute == eminutes && sensor.running == true){
      // TODO stop listening the sensor here
      sensor.running = false;
    }
    
    
  });

}, 1000);
