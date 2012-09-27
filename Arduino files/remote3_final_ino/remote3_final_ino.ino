#include <JeeLib.h>

#include <sdtio.h>
#include <string.h>
// Arduino demo sketch for testing RFM12B + ethernet
// Listens for RF12 messages and displays valid messages on a webpage
// Memory usage exceeds 1K, so use Atmega328 or decrease history/buffers
//
// This sketch is derived from RF12eth.pde:
// May 2010, Andras Tucsni, http://opensource.org/licenses/mit-license.php
//
// The EtherCard library is based on Guido Socher's driver, licensed as GPL2.
//
// Mods bij jcw, 2010-05-20

 int sensorValue, oldSensorValue;

boolean needToSend = 0;
int address;
byte byteArray [5];
byte indata [6];
int i=0;

#define MAX_LINE 20
#define SERIAL  1   // set to 1 to show incoming requests on serial port

static byte outBuf[RF12_MAXDATA], outDest;

void setup(){

  Serial.begin(57600);
  Serial.println("\n[serialRemote version 2.0 - xavier@thefabric.com]");  
  Serial.println("");
  Serial.print(address); 
  rf12_initialize(1, RF12_868MHZ, 33);
}

// ------Boucle sans fin --et--lecture des data---------------
void loop()
{
  i=0;
  while (Serial.available()>0 ){
    indata[i]=Serial.read();
    i++;
  }
//if (i >4) i=0;
// --------------------------------------------------------
// Serial.println( indata[0]);
//  Serial.println( indata[1]);
 //  Serial.println( indata[2]);
               delay(100);
               address=int(indata[0]);         
               byteArray[0] = indata[1]; //R
                byteArray[1] = indata[2]; //G
                byteArray[2] = indata[3]; //B
                byteArray[3] = 0x69;
                needToSend = 1;
             //  Serial.println( byteArray[0]);
 
    //--------------Wireless Receive ----------------------------------
   
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

    //--------------Wireless Send -----------------------------------------
  if (needToSend && rf12_canSend()) {
        needToSend = 0;
      // Serial.println("sending ledstrip RGB values...");
        rf12_sendStart((RF12_HDR_ACK | RF12_HDR_DST | address),byteArray, 3, 1);
      /*  Serial.println("");
        Serial.println();
        Serial.println("");
       Serial.println(byteArray[2]);  */
    } 

} // loop

