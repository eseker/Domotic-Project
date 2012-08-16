
/**
 * Module dependencies.
 */

var express = require('express'), http = require('http');
var events = require('events');
var util = require('util');
var app = express();
var _ = require('underscore');



var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", { baudrate : 57600 });

var data = {
	rooms : ["Salle à manger", "Salon", "Chambre"],
	devices : [{
			id : 4,
			sensor : false,
			name : "Lampe central",
			room : 0,
			interruptor : true,
			color : "#000000"
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
      running: false
		}, {
			id : 21,
			sensor : false,
			name : "Lampe central",
			room : 1,
			interruptor : true,
			color : "#000000"
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
      running: false
		}, {
			id : 23,
			sensor : false,
			name : "entr&eacutee",
			room : 1,
			interruptor : true,
			color : "#000000"
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
	app.set('port', process.env.PORT || 80);
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
		var rgb = toRGB(device.color);
		var message = []
		message[0] = parseInt(device.id.toString(16));
		message[1] = rgb[0];
		message[2] = rgb[1];
		message[3] = rgb[2];
		serialPort.write(message);
		console.log(message);
	}
	res.send("ok");
	
});

serialPort.on("data", function (sdata) {
	console.log("here: " + sdata[3]);
	var device_id = parseInt(sdata[3]); // device id sent from the sensor
	console.log("device_id sent :" + device_id);
  
  console.log("compare test :", (device_id == 10));
	var device = _.find(data.devices, function (element) {
			return element.id == device_id;
		});
	
	if (device) {
    console.log(device);
		if (device.sensor == true && device.running == true) {
			// send here the message to the light
			
			var rgb = toRGB(device.color);
			var message = []
			message[0] = parseInt(device.light.toString(16));
			message[1] = rgb[0];
			message[2] = rgb[1];
			message[3] = rgb[2];
			message[4] = parseInt(device.duration.toString(16))*1000; // convert to miliseconde
			serialPort.write(message);
			console.log(message);
			
		}
	} else {
		console.log("device not found");
	}
	
});


function toRGB(h) {
	var cut = (h.charAt(0) == "#") ? h.substring(1, 7) : h;
	return [parseInt(cut.substring(0, 2), 16), parseInt(cut.substring(2, 4), 16), parseInt(cut.substring(4, 6), 16)];
}

http.createServer(app).listen(app.get('port'), function () {
	console.log("Express server listening on port " + app.get('port'));
});
