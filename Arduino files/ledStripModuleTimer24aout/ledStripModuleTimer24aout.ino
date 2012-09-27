
 #include <JeeLib.h>
 #include <EEPROM.h>
 #include <avr/wdt.h>
 
  #define SERIAL  0   // set to 1 to show incoming requests on serial port
    
  int red,green,blue, time ;
 byte byteArray[2];
 boolean needToSend = 1;
 
  // Blue Old Boards
  int pinR = 3;
  int pinG = 5;
  int pinB = 6;
    

void setup()  { 

  //wdt_enable(7); // reboot mcu every 2 secs just in case
    byteArray[0] = 4 ;
   byteArray[1] = 50 ;
   
  pinMode(3, OUTPUT);
  pinMode(11, OUTPUT);
  
  TCCR2A = _BV(COM2A1) | _BV(COM2B1) | _BV(WGM21) | _BV(WGM20);
  
  pinMode(pinR, OUTPUT);
  pinMode(pinG, OUTPUT);
  pinMode(pinB, OUTPUT);
    
  Serial.begin(57600);
  Serial.println("Victorinox ledStripModule");
     
  rf12_initialize(4, RF12_868MHZ, 33);
} 

void loop()  { 
  
   // wdt_reset();
if (needToSend && rf12_canSend()) {
   Serial.println("sending motion info...");
      Serial.println(byteArray[0]);
   rf12_sendStart((RF12_HDR_ACK | RF12_HDR_DST | 1), byteArray, 2, 1);
   needToSend = 0;
 }
 
   if (rf12_recvDone() && rf12_crc == 0) {
     #if SERIAL
      Serial.print("Message received (size: ");
      Serial.print((int)rf12_len);
      Serial.print(", header: ");
      Serial.print((byte)rf12_hdr);
      Serial.println("): ");
      Serial.println((int)rf12_data[0]);
      Serial.println((int)rf12_data[1]);
      Serial.println((int)rf12_data[2]);
       Serial.println((int)rf12_data[3]);
      #endif
     
      red = rf12_data[0];  
      green = rf12_data[1];   
      blue = rf12_data[2];  
      time = 1000*rf12_data[3];
      // store values as new settings      
 
      EEPROM.write(0,red);       
      EEPROM.write(1,green);       
      EEPROM.write(2,blue);
  
   
   
  
      #if SERIAL
      Serial.println("values updated!");
      #endif
  
     }
   if (time ==0) {
      analogWrite(pinR, red);  
      analogWrite(pinG, green);   
      analogWrite(pinB, blue);
   }
    if(time > 0) {
    analogWrite(pinR, red);  
    analogWrite(pinG, green);   
    analogWrite(pinB, blue);
    delay(time);
  
  time = -1 ;
  }
   if (time == -1) {
     Serial.println(time);
    analogWrite(pinR, 0);  
    analogWrite(pinG, 0);   
    analogWrite(pinB, 0);
   
}
  
    // send message to connexion
    
     
    

}
