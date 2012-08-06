var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyO1", {baudrate : 57600});


console.log("okay...");
setInterval(function() {
       console.log("sending...");
       serialPort.write("blabla");
}, 1000);

serialPort.on("data", function (data) {
   console.log("data: "+data);
});