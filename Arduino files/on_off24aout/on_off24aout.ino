Port leds (1);
MilliTimer sendTimer;
char payload[] = "Hello!";
byte cmd;
byte needToSend;

void setup () {
   Serial.begin(57600);
   Serial.println(57600);
   Serial.println("Send and Receive");
   rf12_initialize(1, RF12_868MHZ, 33);
}

void loop () {

   Serial.println();
   Serial.print("Command: ");

   while (!Serial.available()){}
   cmd = Serial.read();

   if (cmd == '1') {
     Serial.println("Turn ON");
     needToSend = 1;
   }
   if (cmd == '0') {
     Serial.println("Turn OFF");
     needToSend = 1;
   }

   if (rf12_recvDone() && rf12_crc == 0) {
       Serial.println("receive Ok");
       for (byte i = 0; i < rf12_len; ++i)
           Serial.print(rf12_data[i]);
       Serial.println();
       delay(100); // otherwise led blinking isn't visible
   }

   if (needToSend && rf12_canSend()) {
       needToSend = 0;
       rf12_sendStart(0, payload, sizeof payload);
       Serial.println("Send OK");
   }
}
