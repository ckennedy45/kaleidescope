let serial;
let latestData = 0; // Potentiometer value
let smoothedData = 0;
let smoothingFactor = 0.1;
let threshold = 10;
let lastRenderedValue = -1; // Track last rendered value
let radius = 150;
let numSlices = 6; // Default number of slices
let n = 7; // Default rose values
let d = 71;
let colors = []; // Store random colors for each slice

function setup() {
  createCanvas(800, 800);
  angleMode(DEGREES);

  // Setup Serial
  serial = new p5.SerialPort();
  serial.open("/dev/tty.usbmodem101"); // Update with your port name
  serial.on('data', gotData);
  serial.on('open', () => console.log("Serial Port is Open"));

  // Initialize random colors for slices
  for (let i = 0; i < 12; i++) {
    colors.push(color(random(255), random(255), random(255)));
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

function draw() {
  // Check if potentiometer value has changed significantly
  if (abs(latestData - lastRenderedValue) > threshold) {
    lastRenderedValue = latestData;

    // Map potentiometer value to shape parameters
    numSlices = int(map(latestData, 0, 1023, 6, 12)); // Number of slices
    n = int(map(latestData, 0, 1023, 2, 10)); // Rose 'n' value
    d = int(map(latestData, 0, 1023, 50, 100)); // Rose 'd' value

    // Update slice colors
    for (let i = 0; i < numSlices; i++) {
      colors[i] = color(random(255), random(255), random(255));
    }
  }

  background(0);
  translate(width / 2, height / 2);
  let angleIncrement = 360 / numSlices;

  // Draw kaleidoscope
  for (let i = 0; i < numSlices; i++) {
    push();
    rotate(i * angleIncrement);
    drawRose(200, 0, n, d, colors[i]); // Draw the rose shape in the current slice
    pop();

    // Mirrored sector
    push();
    scale(1, -1); // Flip vertically
    rotate(i * angleIncrement);
    drawRose(200, 0, n, d, colors[i]);
    pop();
  }
}

function drawRose(x, y, n, d, col) {
  push();
  translate(x, y); // Offset for each rose within the slice
  noFill();
  stroke(col);
  strokeWeight(1);
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
