#include <SPI.h>
#include <MFRC522.h>  // RFID library
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi Configuration
const char* ssid = "Datto";          // Replace with your WiFi SSID
const char* password = "20041118";  // Replace with your WiFi Password
const char* serverURL = "http://192.168.1.3:8000"; // Replace with your server's IP and port

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

MFRC522 mfrc522_1(SS_PIN_1, RST_PIN_1);  // RFID Reader 1
MFRC522 mfrc522_2(SS_PIN_2, RST_PIN_2);  // RFID Reader 2

// Function to measure distance using ultrasonic sensors
float getDistance(int trigPin, int echoPin) {
  long duration;
  float distance;

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  return distance;
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

// Handle car entry
void handleEntry(String uid, int retryCount = 0) {
  Serial.println("Processing entry for UID: " + uid);

  HTTPClient http;
  String url = String(serverURL) + "/entry"; // Concatenate using String
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String json = "{\"uid\":\"" + uid + "\"}";
  int httpResponseCode = http.POST(json);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);

    if (httpResponseCode == 200) {
      Serial.println("Entry allowed");
      digitalWrite(LED_IN, HIGH);
      digitalWrite(BUZZ, HIGH);
      delay(1000);
      digitalWrite(LED_IN, LOW);
      digitalWrite(BUZZ, LOW);
    } else if (httpResponseCode == 404) {
      Serial.println("Entry endpoint not found (404)");
    } else {
      Serial.println("Entry denied");
    }
  } else {
    Serial.println("Error on sending POST: " + String(httpResponseCode));
    Serial.println("Error message: " + http.errorToString(httpResponseCode));
    if (httpResponseCode == -1 && retryCount < 3) {
      Serial.println("Retrying...");
      delay(2000);
      handleEntry(uid, retryCount + 1); // Retry with incremented count
    }
  }

  http.end();
}

// Handle car exit
void handleExit(String uid, int retryCount = 0) {
  Serial.println("Processing exit for UID: " + uid);

  HTTPClient http;
  String url = String(serverURL) + "/exit"; // Concatenate using String
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String json = "{\"uid\":\"" + uid + "\"}";
  int httpResponseCode = http.POST(json);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);

    if (httpResponseCode == 200) {
      Serial.println("Exit allowed");
      digitalWrite(LED_OUT, HIGH);
      digitalWrite(BUZZ, HIGH);
      delay(1000);
      digitalWrite(LED_OUT, LOW);
      digitalWrite(BUZZ, LOW);
    } else if (httpResponseCode == 404) {
      Serial.println("Exit endpoint not found (404)");
    } else {
      Serial.println("Exit denied");
    }
  } else {
    Serial.println("Error on sending POST: " + String(httpResponseCode));
    Serial.println("Error message: " + http.errorToString(httpResponseCode));
    if (httpResponseCode == -1 && retryCount < 3) {
      Serial.println("Retrying...");
      delay(2000);
      handleExit(uid, retryCount + 1); // Retry with incremented count
    }
  }

  http.end();
}

// Check parking slots
void checkParkingSlots() {
  float distance1 = getDistance(TRIG_PIN_1, ECHO_PIN_1);
  float distance2 = getDistance(TRIG_PIN_2, ECHO_PIN_2);

  if (distance1 < 10) {
    digitalWrite(LED_1, HIGH);
  } else {
    digitalWrite(LED_1, LOW);
  }

  if (distance2 < 10) {
    digitalWrite(LED_2, HIGH);
  } else {
    digitalWrite(LED_2, LOW);
  }
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED && retryCount < 20) {
    delay(500);
    Serial.println("Connecting to WiFi...");
    retryCount++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Connected to WiFi");
  } else {
    Serial.println("Failed to connect to WiFi");
  }
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
    handleEntry(uid);
  }

  if (mfrc522_2.PICC_IsNewCardPresent() && mfrc522_2.PICC_ReadCardSerial()) {
    String uid = getCardUID(mfrc522_2);
    handleExit(uid);
  }

  checkParkingSlots();
  delay(500);
}