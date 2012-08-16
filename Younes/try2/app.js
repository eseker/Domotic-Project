
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
			light : 4
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
			light : 5
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

app.configure(function () {
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
	
	console.log(req.body.data)
	data.devices = req.body.data;
	
	res.send(true);
});

app.post('/send', function (req, res) {
	var devise = req.body;
	
	// send message only for lights
	if (devise.sensor) {
		var rgb = toRGB(devise.color);
		var message = []
		message[0] = parseInt(devise.id.toString(16));
		message[1] = rgb[0];
		message[2] = rgb[1];
		message[3] = rgb[2];
		message[4] = devise.duration;
		serialPort.write(message);
		console.log(message);
	}
	res.send("ok");
	
});


serialPort.on("data", function (data) {
	console.log("here: " + data[3]);
	var devise_id = parseInt(data[3]); // device id sent from the sensor
	console.log("devise_id sent :" + devise_id);
	var devise = _.find(data.devises, function (element) {
			return element.id == device_id;
		});
	
	if (devise) {
		if (devise.sensor && devise.running) {
			// send here the message to the light
			
			var rgb = toRGB(devise.color);
			var message = []
			message[0] = parseInt(devise.light.toString(16));
			message[1] = rgb[0];
			message[2] = rgb[1];
			message[3] = rgb[2];
			message[4] = parseInt(devise.duration*1000, 16); // convert to miliseconde
			serialPort.write(message);
			console.log(message);
			
		}
	} else {
		console.log("devise not found");
	}
	
});

function toRGB(h) {
	var cut = (h.charAt(0) == "#") ? h.substring(1, 7) : h;
	return [parseInt(cut.substring(0, 2), 16), parseInt(cut.substring(2, 4), 16), parseInt(cut.substring(4, 6), 16)];
}

http.createServer(app).listen(app.get('port'), function () {
	console.log("Express server listening on port " + app.get('port'));
});

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
			sminutes = parseInt(sensors.startTime % 60, 10),
			shours = parseInt(sensors.startTime / 60 % 24, 10),
			eminutes = parseInt(sensors.endTime % 60, 10),
			ehours = parseInt(sensors.endTime / 60 % 24, 10);
			
			if (hour == shours && minute == sminutes && sensor.running == false) {
				sensor.running = true;
			} else if (hour == ehours && minute == eminutes && sensor.running == true) {
				sensor.running = false;
			}
			
		});
		
	}, 1000);
