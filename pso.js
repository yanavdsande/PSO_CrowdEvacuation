

let flock;
let bg;
let disaster = false;
let width = 640;
let height = 360;

let slider;
let number_of_boids = 100;

function mouseClicked(event){
    arr.push({x:mouseX, y:mouseY});
    console.log("x:" + mouseX + "y: " + mouseY);
}

function keyPressed(){
  if (key == ' '){ //this means space bar, since it is a space inside of the single quotes 
    disaster = true;
  }  
  else if (keyCode === ENTER){
    disaster = false; 
  }
}

function setup() {
  bg = loadImage('assets/bg2.png');
  createCanvas(width, height);
  frameRate(20);
  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < number_of_boids; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }

  slider = createSlider(0, 1000, 1);
  slider.position(10, 10);
  slider.style('width', '80px');

}
let arr = [];
function draw() {
  background(bg);
  number_of_boids = slider.value();
  flock.run();
}

// Add a new boid into the System
function mouseDragged() {
  flock = null;
  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < number_of_boids; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function FlowField(){
  this.resolution = 10;
  this.cols = width / this.resolution;
  this.rows = height / this.resolution;
  this.field = [] 
}

FlowField.prototype.init = function(){
  for(let i = 0; i < this.cols; i ++){
    this.field[i] = []
    for(let j = 0; j < this.rows; j ++){
      let upperborder = this.rows / 4;
      this.field[i][upperborder - j] = new p5.Vector(0,1)
      this.field[i][this.rows-1] = new p5.Vector(0,-1)
      this.field[0][j] = new p5.Vector(1,0);
      if(i == this.cols -1){
        this.field[this.cols-1][j] = new p5.Vector(-1,0)
      }
      // this.field[i][j] = p5.Vector2D();
    }
  }
}



FlowField.prototype.lookup = function(lookup){
  let column = Math.round(constrain(lookup.x/this.resolution,0,this.cols-1));
  let row = Math.round(constrain(lookup.y/this.resolution,0,this.rows-1));
  return this.field[column][row];
}

function Flock() {
  // An array for all the boids
  this.flowField = new FlowField();
  this.boids = []; // Initialize the array
  this.flowField.init(); // Initalize flowfield
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids,this.flowField);  // Passing the entire list of boids to each boid individually
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 3.0;
  this.maxspeed = 3;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function(boids,flowField) {
  this.flock(boids,flowField);
  this.update();
  this.borders();
  this.render();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}
Boid.prototype.follow = function (flow){
  let desired = flow.lookup(this.position);
  if(desired === undefined){
    return;
  }
  desired.mult(this.maxspeed);
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}
// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids, flowField) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  let fol = this.follow(flowField);
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // fol.mult(1.5);
  // Add the force vectors to acceleration
  if(disaster){
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }else{
    this.applyForce(fol);
  }
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  let theta = this.velocity.heading() + radians(90);
  fill(127);
  stroke(200);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r * 2);
  vertex(-this.r, this.r * 2);
  vertex(this.r, this.r * 2);
  endShape(CLOSE);
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r){
      this.position.x = this.position.x + this.r;
  }
  if (this.position.y < -this.r){
      this.position.y = this.position.y + this.r;
  } 
  if (this.position.x > width + this.r) {
    this.position.x = width -this.r;
  }
  if (this.position.y > height + this.r){
    this.position.y = height -this.r;
  } 
}



// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0,0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}


