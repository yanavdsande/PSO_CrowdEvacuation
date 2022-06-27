import numpy as np
import matplotlib.pyplot as plt
# generate random integer values
from random import seed
from random import randint
particles = [];
# Constants
beta = 0.9
tau = 0.5
factor = 1 # Scale
r_min = 0.1 * factor
r_max = 0.37 * factor
v_d_max = 0.95 * factor # in meters per second
# Simulation constants
width = 20 * factor # in meters
height = 20 * factor # in meters
padding = 0 #50
nr_particles = 365
delta_time = 0.1
targetX = width / 2
targetY = height;
offset = 0
def dist(a,b):
    return np.linalg.norm(np.subtract(a,b))

def flatten(xss):
    return [x for xs in xss for x in xs]

def setup():
  seed(1)
  for i in range(nr_particles):
    # let r = random (r_min, r_max); 
    r = r_max;
    pos = np.array([randint(padding, width - padding),randint(padding, height - padding)])
    target = np.array ([targetX, targetY]);
    particles.append( Particle(i, pos, target, r, target) )
  vs = []
  ds = []
  while(len(particles) > 0) : 
    v,d = draw()
    if len(v) > 0 and len(d) > 0:
      vs.append(v)
      ds.append(d)
  vs = flatten(vs) 
  ds = flatten(ds)
  plt.plot(ds,vs)
  plt.xlabel("Density (1/$m^2)$")
  plt.ylabel("Velocity (m/s)")
  plt.show()

def update():
  X = np.empty
  Y = np.empty
  for p1 in particles:
        if (p1.pos[0] >= targetX - 10 or p1.pos[0] <= targetX + 10) and p1.pos[1] >= targetY - 10:
            particles.remove(p1)
            # print(len(particles))
        
        for p2 in particles:
            if(p1.pos[0] < p1.r): # Left wall hit
                p1.add_collision(np.array([0, p1.pos[1]]))
            elif(p1.pos[0] > width - p1.r): # Right wall hit
                p1.add_collision(np.array([width, p1.pos[1]]))

            if(p1.pos[1] > height - p1.r): # top wall hit
                p1.add_collision(np.array([p1.pos[0], height]))
            elif(p1.pos[1] < p1.r): # bottom wall hit
                p1.add_collision(np.array([p1.pos[0], 0]))

            if(dist(p1.pos, p2.pos) < p1.r): # collision with p1 and p2
                p1.add_collision(p2.pos)
        p1.update();
        [x,y] = p1.draw()   
        np.append(X, x)
        np.append(Y, y)
  return X, Y 
def projection(a,b):
      return (np.dot(a, b) / np.dot(b, b)) * b
def draw():
      x,y = update()
      density = len(particles) / 12 * np.pi
      velocity = 0
      for p in particles:
            if p.escape_v is None : continue
            velocity = projection(p.escape_v, v_d_max)
      v = []
      d = []
      if velocity is not 0: 
        velocity = np.divide(velocity, len(particles))
        speed = np.sqrt(np.dot(velocity, velocity))
        v.append( min(speed, v_d_max) )
        d.append( np.sqrt(density) )
      return v, d
      # for p in plot:
        # print("velocity:", p[0], " density:", p[1])  
        # print("velocity:", type(p[0]), " density:", type(p[1]))  

      # plt.plot(v, d)
      # Directional vectors
      # u = targetX
      # v = targetY
    
      # # Plotting Vector Field with QUIVER
      # plt.quiver(x, y, u, v, color='g')
      # plt.title('Vector Field')
        
      # # Setting x, y boundary limits
      # plt.xlim(-7, 7)
      # plt.ylim(-7, 7)
        
      # # Show plot with grid
      # plt.grid()
      # plt.show()
      #print(self.pos)
      

class Particle : 
  def __init__(self,id, pos, velocity, radius, target):
    self.id = id;   
    self.t = target;
    self.pos = pos;
    self.r = radius; # Dynamically adjusted between min(i) and max(i)
    self.e_ij = np.array([0,0])
    self.escape_v = None;
    self.update_target_v();
  
  def draw(self):
      x = self.pos[0]
      y = self.pos[1]
      return [x, y]
      
  
  def add_collision(self, other_pos):
    diff_pos = np.subtract(self.pos,other_pos);
    if diff_pos[0] != 0 and diff_pos[1] != 0:
        self.e_ij = np.divide(diff_pos, np.square(np.linalg.norm(diff_pos)))  # diff_pos.copy().div(diff_pos.copy().magSq());
  
  def update_radius(self):
    if self.escape_v is not None:
      self.r = r_min;
    else:
      self.r += r_max / (tau / delta_time);
      self.r = min(self.r, r_max);
  def update_escape_v(self, v_e):
    if self.e_ij[0] == 0 and self.e_ij[1] == 0:
      self.escape_v = None
    else:
      self.escape_v = np.multiply(self.e_ij, v_e)
      self.e_ij = np.array([0,0])
  
  def update_target_v(self):
    v_mod = v_d_max * ((self.r - r_min) / (r_max - r_min))**beta;
    self.direction = np.linalg.norm(np.subtract(self.t, self.pos)) # this.direction = this.t.copy().sub(this.pos).normalize(); 
    self.v = np.multiply(self.direction, v_mod)
  
  def update(self):
    self.update_escape_v(v_d_max);
    self.update_radius();
    if self.escape_v is None:
        self.update_target_v();
        self.pos = np.add(self.pos, np.multiply(self.v, delta_time))
    else:
        self.pos = np.add(self.pos, np.multiply(self.escape_v, delta_time))

 

class Velocity:
  def __init__(self, x,y):
    self.d = np.array([x,y]);
    
  def desired(self):
    return self.d;
  def speed(self):
    return np.linalg.norm(self.d);



setup()