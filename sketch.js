hlet serial;
let latestData = 0; // Potentiometer value
let smoothedData = 0;
let smoothingFactor = 0.1;
let threshold = 10;
let lastRenderedValue = -1; // Track last rendered value
let radius = 100;
let numSlices = 12; // Number of slices for symmetry
let n = 6; // Constant rose 'n' value
let d = 1; // Starting 'd' value, controlled by potentiometer
let colors = []; // Store colors for each slice

function sketchsetup() {
  createCanvas(800, 800);
  angleMode(DEGREES);

  // Setup Serial
  serial = new p5.SerialPort();
  serial.open("/dev/tty.usbmodem101"); // Update with your port name
  serial.on('data', gotData);
  serial.on('open', () => console.log("Serial Port is Open"));

  // Initialize themed colors for slices
  for (let i = 0; i < numSlices; i++) {
    colors.push(colorTheme(i, numSlices));
  }
}

function gotData() {
  let currentString = serial.readLine();
  if (currentString) {
    let newValue = int(currentString);
    if (abs(newValue - smoothedData) > threshold) {
      smoothedData = lerp(smoothedData, newValue, smoothingFactor);
      latestData = int(smoothedData);
    }
  }
}

function sketchdraw() {
  // Map potentiometer value to 'd' range [1, 360]
  d = int(map(latestData, 0, 1023, 1, 360));

  // Check if potentiometer value has changed significantly
  if (abs(latestData - lastRenderedValue) > threshold) {
    lastRenderedValue = latestData;

    // Map potentiometer value to shape parameters
    numSlices = int(map(latestData, 0, 1023, 6, 24)); // Number of slices

    // Update slice colors based on theme
    colors = [];
    for (let i = 0; i < numSlices; i++) {
      colors.push(colorTheme(i, numSlices));
    }
  }

  background(0);
  translate(width / 2, height / 2);
  let angleIncrement = 360 / numSlices;

  // Draw kaleidoscope
  for (let i = 0; i < numSlices; i++) {
    push();
    rotate(i * angleIncrement);
    drawRose(200, 0, n, d, colors[i], 1); // Draw the rose shape in the current slice
    pop();

    // Mirrored sector
    push();
    scale(-1, 1); // Flip horizontally
    rotate(i * angleIncrement);
    drawRose(200, 0, n, d, colors[i], 1);
    pop();
  }

  // Add central shape
  drawCentralRose();
}

function drawRose(x, y, n, d, col, scaleFactor) {
  push();
  translate(x, y); // Offset for each rose within the slice
  scale(scaleFactor);

  // Gradient fill for the rose
  noStroke();
  for (let r = radius; r > 0; r -= 5) {
    fill(hue(col), 80, map(r, 0, radius, 100, 50), 0.8); // Gradual gradient
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

  // Overlay the Maurer Rose lines
  stroke(hue(col), 100, 100, 0.8); // Semi-transparent stroke
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
  translate(0, 0); // Center the shape
  noStroke();
  colorMode(HSB, 360, 100, 100);

  // Gradient fill for central rose
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

  // Overlay the Maurer Rose lines
  stroke(60, 100, 100, 0.8); // Semi-transparent stroke
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
  // Create a cohesive gradient color theme
  let hueValue = map(index, 0, total, 0, 360);
  let saturation = 80;
  let brightness = 90;
  colorMode(HSB, 360, 100, 100);
  return color(hueValue, saturation, brightness);
}
