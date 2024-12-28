#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
 
// WiFi Configuration
const char* ssid = "Datto";
const char* password = "20041118";
const char* serverURL = "http://192.168.1.6:8000/api";
 
// Pin Configuration
#define SS_PIN_1 21
#define RST_PIN_1 26
#define SS_PIN_2 22
#define RST_PIN_2 27
 
#define LED_IN 32
#define LED_OUT 33
#define LED_1 24
#define LED_2 25
#define BUZZ 12
 
#define TRIG_PIN_1 15
#define ECHO_PIN_1 2
#define TRIG_PIN_2 4
#define ECHO_PIN_2 5
 
MFRC522 mfrc522_1(SS_PIN_1, RST_PIN_1); // RFID Reader 1
MFRC522 mfrc522_2(SS_PIN_2, RST_PIN_2); // RFID Reader 2
 
// Parking slot statuses
bool parkingSlot1Occupied = false;
bool parkingSlot2Occupied = false;
 
// Define parking lot ID
const String parkingLotId = "1";
 
// Function to measure distance using ultrasonic sensors
float getDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
 
  long duration = pulseIn(echoPin, HIGH);
  return (duration * 0.034 / 2);
}
 
// Get UID from RFID card
String getCardUID(MFRC522 &rfid) {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  rfid.PICC_HaltA();
  return uid;
}
 
// Send HTTP POST request to server
String sendPostRequest(String endpoint, String payload) {
  HTTPClient http;
  String url = String(serverURL) + endpoint;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
 
  int httpResponseCode = http.POST(payload);
  String response = (httpResponseCode > 0) ? http.getString() : "";
 
  Serial.println("POST Request: " + url);
  Serial.println("Payload: " + payload);
  Serial.println("HTTP Response code: " + String(httpResponseCode));
  Serial.println("Response: " + response);
 
  http.end();
  return response;
}
 
// Handle car entry
void handleEntry(String cardId) {
  String response = sendPostRequest("/parking-lot/entry-parking/" + cardId, "{}");
 
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, response);
 
  if (!error) {
    const char* message = doc["message"];
    if (strcmp(message, "PARKING_SUCCESSFUL") == 0) {
      digitalWrite(LED_IN, HIGH);
      digitalWrite(BUZZ, HIGH);
      delay(1000);
      digitalWrite(LED_IN, LOW);
      digitalWrite(BUZZ, LOW);
    } else {
      Serial.println("Entry denied: " + String(message));
    }
  } else {
    Serial.println("Failed to parse server response for entry.");
  }
}
 
// Handle car exit
void handleExit(String cardId) {
  String response = sendPostRequest("/parking-lot/exit-parking/" + cardId, "{}");
 
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, response);
 
  if (!error) {
    const char* message = doc["message"];
    if (strcmp(message, "CHECKOUT_SUCCESSFUL") == 0) {
      digitalWrite(LED_OUT, HIGH);
      digitalWrite(BUZZ, HIGH);
      delay(1000);
      digitalWrite(LED_OUT, LOW);
      digitalWrite(BUZZ, LOW);
    } else {
      Serial.println("Exit denied: " + String(message));
    }
  } else {
    Serial.println("Failed to parse server response for exit.");
  }
}
 
// Check parking slots and send statuses to the server
// Check parking slots and send statuses to the server
void checkParkingSlots() {
  float distance1 = getDistance(TRIG_PIN_1, ECHO_PIN_1);
  float distance2 = getDistance(TRIG_PIN_2, ECHO_PIN_2);

  bool slot1 = (distance1 < 5); // Slot 1 occupied if distance < 10
  bool slot2 = (distance2 < 5); // Slot 2 occupied if distance < 10

  digitalWrite(LED_1, slot1 ? HIGH : LOW);
  digitalWrite(LED_2, slot2 ? HIGH : LOW);

  // Nếu trạng thái của slot thay đổi, thực hiện check-in hoặc check-out
  if (slot1 != parkingSlot1Occupied) {
    parkingSlot1Occupied = slot1;

    if (slot1) {
      // Gọi API check-in khi xe vào ô đỗ 1
      String payload = "{\"slot_id\":1}";
      sendPostRequest("/parking-lot/check-in/1", payload);
    } else {
      // Gọi API check-out khi ô đỗ 1 trống
      String payload = "{\"slot_id\":1}";
      sendPostRequest("/parking-lot/check-out/1", payload);
    }
  }

  if (slot2 != parkingSlot2Occupied) {
    parkingSlot2Occupied = slot2;

    if (slot2) {
      // Gọi API check-in khi xe vào ô đỗ 2
      String payload = "{\"slot_id\":2}";
      sendPostRequest("/parking-lot/check-in/2", payload);
    } else {
      // Gọi API check-out khi ô đỗ 2 trống
      String payload = "{\"slot_id\":2}";
      sendPostRequest("/parking-lot/check-out/2", payload);
    }
  }
}

 
// Connect to WiFi
void connectToWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}
 
void setup() {
  Serial.begin(115200);
  connectToWiFi();
 
  SPI.begin();
  mfrc522_1.PCD_Init();
  mfrc522_2.PCD_Init();
 
  pinMode(TRIG_PIN_1, OUTPUT);
  pinMode(ECHO_PIN_1, INPUT);
  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);
  pinMode(LED_IN, OUTPUT);
  pinMode(LED_OUT, OUTPUT);
  pinMode(LED_1, OUTPUT);
  pinMode(LED_2, OUTPUT);
  pinMode(BUZZ, OUTPUT);
 
  Serial.println("Setup complete.");
}
 
void loop() {
  if (mfrc522_1.PICC_IsNewCardPresent() && mfrc522_1.PICC_ReadCardSerial()) {
    String uid = getCardUID(mfrc522_1);
    Serial.println("Card detected for entry: " + uid);
    handleEntry(uid);
  }
 
  if (mfrc522_2.PICC_IsNewCardPresent() && mfrc522_2.PICC_ReadCardSerial()) {
    String uid = getCardUID(mfrc522_2);
    Serial.println("Card detected for exit: " + uid);
    handleExit(uid);
  }
 
  checkParkingSlots();
  delay(1000);
}