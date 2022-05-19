const particles = [];
// Constants
const beta = 0.9;
const tau = 0.5;
const factor = 50; // Scale
const r_min = 0.1 * factor
const r_max = 0.37 * factor
const v_d_max = 0.95 * factor // in meters per second
// Simulation constants
const width = 20 * factor // in meters
const height = 20 * factor // in meters
const padding = 50;
const nr_particles = 200;
const delta_time = 0.1


function setup(){
  createCanvas(width, height);
  frameRate(24)
  for(let i = 0; i < nr_particles; i ++)
  {
    // let r = random (r_min, r_max);
    let r = r_max;
    let pos = createVector(random(padding, width - padding),random(padding, height - padding));
    let target = createVector (width / 2, height);
    particles[i] = new Particle(i, pos, target, r, target);
  }
}

function draw(){
  background(127);
  
  for(let i = 0; i < nr_particles; i ++)
  {
    const p1 = particles[i];
    for(let j = 0; j < nr_particles; j ++){
      const p2 = particles[j];
      if(p1.pos.x < p1.r){ // Left wall hit
          p1.add_collision(createVector(0, p1.pos.y));
      }else if(p1.pos.x > width - p1.r){ // Right wall hit
          p1.add_collision(createVector(width, p1.pos.y));
      }

      if(p1.pos.y > height - p1.r){ // top wall hit
          p1.add_collision(createVector(p1.pos.x, height));
      }else if(p1.pos.y < p1.r){ // bottom wall hit
          p1.add_collision(createVector(p1.pos.x, 0));
      }

      if(dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y) < p1.r){ // collision with p1 and p2
          p1.add_collision(p2);
      }
    }
    p1.update();  
    p1.draw();
  }
}

class Particle{
  constructor(id, pos, velocity, radius, target){
    this.id = id;   
    this.t = target;
    this.pos = pos;
    this.r = radius; // Dynamically adjusted between min(i) and max(i)
    this.e_ij = createVector(0,0)
    this.escape_v = undefined;
    this.update_target_v();
  }
  add_collision(other){
    const diff_pos = this.pos.copy().sub(other.pos);
    if(diff_pos.x != 0 && diff_pos.y != 0){
        this.e_ij = diff_pos.copy().div(diff_pos.copy().magSq());
    }
  }
  update_escape_v(v_e){
    if(this.e_ij.x == 0 && this.e_ij.y == 0){
      this.escape_v = undefined;
    }else {
      this.escape_v = this.e_ij.copy().mult(v_e);
      this.e_ij.set(0,0);
    }
  }
  update_target_v(){  
    const v_mod = v_d_max * ((this.r - r_min) / (r_max - r_min))^beta;
    this.direction = this.t.copy().sub(this.pos).normalize(); 
    this.v = this.direction.mult(v_mod);
  }
  update(){
    this.update_escape_v(v_d_max);
    if(this.escape_v != undefined){
        this.pos.add(this.escape_v.mult(delta_time));
    }else{
        this.update_target_v();
        this.pos.add(this.v.mult(delta_time));  
    }
  }
  draw(){
    ellipse(this.pos.x,this.pos.y,this.r,this.r);
    drawArrow(this.pos, this.direction);
  }
}

class Velocity{
  constructor(x,y){
    this.d = createVector(x,y);
  }
  get desired(){
    return this.d;
  }
  get speed(){
    return this.d.mag();
  }
}

// draw an arrow for a vector at a given base position
function drawArrow(base, vec) {
  push();
  stroke(0);
  strokeWeight(1);
  fill(0);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 1;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}