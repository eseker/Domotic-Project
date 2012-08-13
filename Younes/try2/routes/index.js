
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'App Domotique' });
};

exports.aboutus = function(req, res){
  res.render('aboutus', { title: 'About us' });
};


exports.room = function(req, res){


	var message = ''
	message += 'Sent data to Room ' + req.params.id + ' Arduino.'
	message += '<br>Red:' + req.params.r
	message += '<br>Green:' + req.params.g
	message += '<br>Blue:' + req.params.b

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", {baudrate : 57600});


var message1 =   req.params.id +'R' + req.params.r +'G'+ req.params.g+'B' + req.params.b+'F';
 //var red = '255R0G0B0F'
 //message1= message1.toString(16);
 
 //var  byte message2[] = (byte)message1; 
 
 var   message3 = req.params.r;
 //message3= message3.toString(16)+',';
 var   message4 =255255;
 message4= message4.toString(16);
  
  var message5 =[];
  message5[0]= req.params.id.toString(16);
  message5[1]= req.params.r.toString(16);
  message5[2]=req.params.g.toString(16);
  message5[3]=req.params.b.toString(16);

  
  //message5= message5.toString(16)+'\0';

//var byteArray = new Array(0xFA, 0xFC, 0x255);

  // we will send data to serial port here

       
      serialPort.write(message5);

    console.log(message5);
      
    res.send(message);

};

/*function onrequest(request,fxpir){
console.log('ddddddd'+data);
};*/