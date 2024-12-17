let serial;
let latestData = 0; // Potentiometer value
let lightValue = 0; // Light sensor value
let buttonState = false; // Toggle state for button at D4
let smoothedData = 0;
let smoothingFactor = 0.1;
let threshold = 10;
let lastRenderedValue = -1; // Track last rendered value
let baseRadius = 100; // Baseline starting radius
let radius = baseRadius; // Dynamically changing radius
let numSlices = 12; // Number of slices for symmetry
let n = 6; // Constant rose 'n' value
let d = 1; // Starting 'd' value, controlled by potentiometer
let colors = []; // Store colors for each slice
let fillMode = true; // Toggle between filled and unfilled mode
let buttonPressed = false; // Prevent button toggle spamming
let rotationAngle = 0; // Global rotation angle

function setup() {
  createCanvas(800, 800);
  angleMode(DEGREES);

  // Setup Serial
  serial = new p5.SerialPort();
  serial.open("/dev/tty.usbmodem101"); 
  serial.on('data', gotData);
  serial.on('open', () => console.log("Serial Port is Open"));

  for (let i = 0; i < numSlices; i++) {
    colors.push(colorTheme(i, numSlices));
  }
}

function gotData() {
  let currentString = serial.readLine();
  if (currentString) {
    let parts = currentString.split(',');
    if (parts.length === 3) {
      let potValue = int(parts[0].split(':')[1]);
      let newLightValue = int(parts[1].split(':')[1]);
      let button = int(parts[2].split(':')[1]);

      if (abs(potValue - smoothedData) > threshold) {
        smoothedData = lerp(smoothedData, potValue, smoothingFactor);
        latestData = int(smoothedData);
      }

      lightValue = constrain(newLightValue, 0, 1023);

      if (button === 1 && !buttonPressed) {
        fillMode = !fillMode;
        buttonPressed = true; 
      } else if (button === 0) {
        buttonPressed = false; 
      }
    }
  }
}

function draw() {
  
  let expandedRadius = map(lightValue, 0, 1023, baseRadius, baseRadius * 2.5);
  radius = max(expandedRadius, baseRadius); 

  d = int(map(latestData, 0, 1023, 1, 360));

  let rotationSpeed = map(lightValue, 0, 1023, 0, 2); 
  rotationAngle += rotationSpeed;

  if (abs(latestData - lastRenderedValue) > threshold) {
    lastRenderedValue = latestData;

    numSlices = int(map(latestData, 0, 1023, 6, 24));
    colors = [];
    for (let i = 0; i < numSlices; i++) {
      colors.push(colorTheme(i, numSlices));
    }
  }

  background(0);
  translate(width / 2, height / 2);
  rotate(rotationAngle); 
  let angleIncrement = 360 / numSlices;

  for (let i = 0; i < numSlices; i++) {
    push();
    rotate(i * angleIncrement);
    drawRose(200, 0, n, d, colors[i], 1);
    pop();

    push();
    scale(-1, 1);
    rotate(i * angleIncrement);
    drawRose(200, 0, n, d, colors[i], 1);
    pop();
  }

  drawCentralRose();
}

function drawRose(x, y, n, d, col, scaleFactor) {
  push();
  translate(x, y);
  scale(scaleFactor);

  if (fillMode) {
    noStroke();
    for (let r = radius; r > 0; r -= 5) {
      fill(hue(col), 80, map(r, 0, radius, 100, 50), 0.8);
      beginShape();
      for (let i = 0; i < 361; i++) {
        let k = i * d;
        let rad = r * sin(n * k);
        let x = rad * cos(k);
        let y = rad * sin(k);
        vertex(x, y);
      }
      endShape(CLOSE);
    }
  }

  stroke(hue(col), 100, 100, 0.8);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let i = 0; i < 361; i++) {
    let k = i * d;
    let r = radius * sin(n * k);
    let x = r * cos(k);
    let y = r * sin(k);
    vertex(x, y);
  }
  endShape(CLOSE);

  pop();
}

function drawCentralRose() {
  push();
  translate(0, 0);

  if (fillMode) {
    noStroke();
    for (let r = radius * 1.5; r > 0; r -= 5) {
      fill(map(r, 0, radius * 1.5, 200, 60), 80, 90);
      beginShape();
      for (let i = 0; i < 361; i++) {
        let k = i * d;
        let rad = r * sin(n * k);
        let x = rad * cos(k);
        let y = rad * sin(k);
        vertex(x, y);
      }
      endShape(CLOSE);
    }
  }

  stroke(60, 100, 100, 0.8);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let i = 0; i < 361; i++) {
    let k = i * d;
    let r = radius * 1.5 * sin(n * k);
    let x = r * cos(k);
    let y = r * sin(k);
    vertex(x, y);
  }
  endShape(CLOSE);

  pop();
}

function colorTheme(index, total) {
  let hueValue = map(index, 0, total, 0, 360);
  let saturation = 80;
  let brightness = 90;
  colorMode(HSB, 360, 100, 100);
  return color(hueValue, saturation, brightness);
}
