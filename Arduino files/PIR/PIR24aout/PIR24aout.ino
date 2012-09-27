#include <JeeLib.h>
#define SERIAL  0   // set to 1 to show incoming requests on serial port

byte byteArray[2];
boolean needToSend = 0;
int sensorValue, oldSensorValue;

void setup() {
 Serial.begin(57600);
 Serial.println("PIR Motion Sensor - TheFabric");
 pinMode(3, INPUT);
 digitalWrite(3, HIGH);
 rf12_initialize(10, RF12_868MHZ, 33);

 byteArray[0] = 10;
 byteArray[1] = 50;
 //byteArray[2] = 0x00;
}

void loop() {
 sensorValue = digitalRead(3);
 if (sensorValue && !oldSensorValue) needToSend = 1;
 //Serial.println(sensorValue, DEC);
 oldSensorValue = sensorValue;
 delay(100);

 if (rf12_recvDone() && rf12_crc == 0) {
   #if SERIAL
   Serial.print("Message received (size: ");
   Serial.print((int)rf12_len);
   Serial.print(", header: ");
   Serial.print((byte)rf12_hdr);
   Serial.print("): ");
   Serial.print((int)rf12_data[0]);
   Serial.print((int)rf12_data[1]);
   Serial.println((int)rf12_data[2]);
   #endif
 }  
 if (needToSend && rf12_canSend()) {
   Serial.println("sending motion info...");
   rf12_sendStart( (RF12_HDR_ACK | RF12_HDR_DST | 1), byteArray, 2, 1);
   needToSend = 0;
 }
}

