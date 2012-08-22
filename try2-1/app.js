/**
 * Module dependencies.
 */

var express = require('express'), 
	http = require('http'),
	events = require('events'),
	util = require('util'),
	app = express(),
	_ = require('underscore'),
	nowjs = require("now");



var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/tty1", { baudrate : 57600 });

var data = {
	rooms : ["Salle à manger", "Salon", "Chambre"],
	devices : [{
			id : 4,
			sensor : false,
			name : "Lampe centrale",
			room : 0,
			interruptor : true,
			color : "#000000",
			connected: false
		}, {
			id : 10,
			sensor : true,
			name : "Capteur IR",
			room : 0,
			startTime : 540,
			endTime : 1020,
			duration : 5,
			color : "#000000",
			light : 4,
			running: false,
			connected: false			
		}, {
			id : 21,
			sensor : false,
			name : "Lampe centrale",
			room : 1,
			interruptor : true,
			color : "#000000",
			connected: false			
		}, {
			id : 22,
			sensor : true,
			name : "Capteur IR",
			room : 1,
			startTime : 540,
			endTime : 1020,
			duration : 10,
			color : "#000000",
			light : 5,
			connected: false,		
      	  	running: false
		}, {
			id : 23,
			sensor : false,
			name : "entrée",
			room : 1,
			interruptor : true,
			color : "#000000",
			connected: false			
		}
	]
}



var interval = setInterval(function () {
		var now = new Date;
		var hour = now.getHours();
		var minute = now.getMinutes();
		var sminutes,
		shours,
		eminutes,
		ehours
		
		var sensors = _.filter(data.devices, function (d) {
				return d.sensor == true;
			});

		_.each(sensors, function (sensor) {
			sminutes = parseInt(sensor.startTime % 60, 10),
			shours = parseInt(sensor.startTime / 60 % 24, 10),
			eminutes = parseInt(sensor.endTime % 60, 10),
			ehours = parseInt(sensor.endTime / 60 % 24, 10);
			
      if (hour >= shours && hour < ehours && sensor.running == false) {
        sensor.running = true;     
        console.log("sensor id="+sensor.id+" ON");  
			} else if (hour > ehours &&  sensor.running == true) {
        sensor.running = false;       
        console.log("sensor id="+sensor.id+" OFF");        
			}
			
		});
		
	}, 1000);

  
app.configure(function () {
	app.set('port', process.env.PORT || 3003);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	//app.use(express.static(__dirname + '/public'));
	app.use(express.static(require('path').resolve(__dirname + "/public")));
});

app.configure('development', function () {
	app.use(express.errorHandler());
});

app.get('/', function (req, res) {
	res.render('index', {
		title : 'App Domotique'
	});
});

app.get('/aboutus', function (req, res) {
	res.render('aboutus', {
		title : 'About us'
	});
});

app.get('/settings', function (req, res) {
	res.send(data);
});

app.post('/settings', function (req, res) {
	
  
  // convert string to boolean
  _.each(req.body.data, function (device) {
      device.interruptor = ( device.interruptor == "true");
      device.sensor = ( device.sensor == "true");
      // restaure running value
      var old = _.find(data.devices, function(element){ return element.id == device.id; });
      device.running= old.running;
  });
	
	data.devices = req.body.data;
	res.send(true);
});

app.post('/send', function (req, res) {
	var device = req.body;
	
	// send message only for lights
	if (device.sensor == "false") {
		// when the interruptor is false send black of #000000
		var rgb = (device.interruptor == "true") ? toRGB(device.color) : [0,0,0];
		var message = []
		message[0] = parseInt(device.id.toString(16));
		message[1] = rgb[0];
		message[2] = rgb[1];
		message[3] = rgb[2];
		message[4]= 0;
		//serialPort.write(message);
		console.log(message);
	}
	
	res.send("ok");
	
});


serialPort.on("data", function (sdata) {

	var device_id = parseInt(sdata[3]); 
	var device = _.find(data.devices, function (element) {
			return element.id == device_id;
		});

	if (device) 
	{
		
		// if the device is not connected update it status and notify the client
		if(device.connected == false){
			device.connected = true;
			// send update to client
			everyone.now.deviceConnected(data);		
		}else {
			// if the sensor is running
			if (device.sensor == true && device.running == true) {
				// send here the message to the light
				// parse the color
				var rgb = toRGB(device.color);
				var message = []
				message[0] = parseInt(device.light.toString(16));
				message[1] = rgb[0];
				message[2] = rgb[1];
				message[3] = rgb[2];
				message[4] = parseInt(device.duration.toString(16));
				serialPort.write(message);
			}
		}
		
	} else {
		console.log("device not found");
	}
			
	
});


function toRGB(h) {
	var cut = (h.charAt(0) == "#") ? h.substring(1, 7) : h;
	return [parseInt(cut.substring(0, 2), 16), parseInt(cut.substring(2, 4), 16), parseInt(cut.substring(4, 6), 16)];
}


var server = app.listen(app.get('port'));
var everyone = require("now").initialize(server);

