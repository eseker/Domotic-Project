
var util = require("util"), repl = require("repl");

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", {baudrate : 57600});

SerialPort.on("data", function (data) {
  util.puts("here: "+data);
})
SerialPort.on("error", function (msg) {
  util.puts("error: "+msg);
})
repl.start("=>")

//serial_port.close();