const particles = [];
// Constants
const beta = 0.9;
const tau = 0.5;
const factor = 20; // Scale
const r_min = 0.1 * factor
const r_max = 0.37 * factor
const v_d_max = 0.95 * factor // in meters per second
// Simulation constants
const width = 20 * factor // in meters
const height = 20 * factor // in meters
const padding = 50;
const nr_particles = 100;


function setup(){
  createCanvas(width, height);

  for(let i = 0; i < nr_particles; i ++)
  {
    let r = random (r_min, r_max);
    let pos = createVector(random(padding, width - padding),random(padding, height - padding));
    let target = createVector (width / 2, 0);
    particles[i] = new Particle(i, pos, target, r, target);
  }
}

function draw(){
  background(127);
  
  for(let i = 0; i < nr_particles; i ++)
  {
    particles[i].update(1);
    particles[i].draw();
  }
}

class Particle{
  constructor(id, pos, velocity, radius, target){
    this.id = id;   
    this.t = target;
    this.pos = pos;
    this.r = radius; // Dynamically adjusted between min(i) and max(i)
    this.update_target_v();
  }
  update_target_v(){
    const v_mod = v_d_max * ((this.r - r_min) / (r_max - r_min))^beta;
    this.direction = this.t.copy().sub(this.pos).normalize(); 
    this.v = this.direction.mult(v_mod);
  }
  update(delta_time){
    this.update_target_v();
    this.pos.add(this.v.mult(delta_time));  
  }
  draw(){
    ellipse(this.pos.x,this.pos.y,this.r,this.r);
    drawArrow(this.pos, this.direction);
  }
}
/*
i is the specific particle
r is the radius
d is desired velocity
b is magnitude
*/
// function v_d_max (i, r, d, b)
// {
//   return max(d) * ((r[i] - min(r))/(max(r) - min(r)))^b;
// }

// function delta_r (i,r,d,b) {
//   return max(r) / (tau / delta_t(i,r,d,b))
// }

// function delta_t (i,r,d,b) {
//   return min(r) / 2 * max(v_d_max(i,r,d,b));
// }

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