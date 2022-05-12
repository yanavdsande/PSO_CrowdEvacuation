#%%
from tqdm import tqdm
import matplotlib.pyplot as plt 
import numpy as np 
# %%
class Particle:
    def __init__(self, pos,velocity, f, w, c1, c2, r1, r2, xlimit, N_c):
        """ 
        pos = starting position 
        velocity = starting velocity 
        f = objective function 
        w = weight 
        c1,c2 = cognition weights 
        r1,r2 = acceleration weights 
        xlimit = bounds on searchspace 
        N_c = number of clusters

        """  
       
        self.x = pos #position
        self.v = velocity #velocity
        self.y = self.x #personal best_positon
        self.py = np.inf #personal best 
        self.objective = f

        #parameters
        self.w = w #inertia weight
        self.c1 = c1 #acceleration constant 
        self.c2 = c2 #accelartation constant
        self.r1 = r1 
        self.r2 = r2 

        #storage
        self.history = [self.x] #trajectory in search-space
        
    def evaluation(self): 
        """ 
        A function that updates the personal best fitness value and the corresponding position 
        Returns:        fitness
        """
        fitness = self.objective(self.x)[0]
        if fitness < self.py:
            self.py = fitness 
            self.y = self.x
        return fitness 
    
    def update(self, gy, vlimit, xlimit):
        """ 
        Update function to update velocity and position and store the trajectory of the particle
        Arguments:          gy = global best fitness position 
                            vlimit = bound to velocity, type = List
                            xlimit = bound to position, type = List
        
        Note: sometimes your x or v values can explode, in these cases, uncomment bound and use a predefined bound
        """
        self.v = self.w * self.v + (self.c1 * self.r1 * (self.y - self.x)) + (self.c2 * self.r2 * (gy - self.x))
        #bound velocity 
        # if self.v < vlimit[0]:
        #     self.v = vlimit[0]
        # if self.v > vlimit[1]: 
        #     self.v = vlimit[1]
        self.x = self.x + self.v
        # #bound position 
        # if self.x < xlimit[0]: 
        #     self.x = xlimit[0]
        # if self.x > xlimit[1]:
        #     self.x = xlimit[1]

        #story trajectory
        self.history.append(self.x)


def test_function(x): 
    """
    Takes input and returns the square root
    Note: this was only to test the initial program 
    """
    return x**2

def optimize(iterations, ps):
    """
    Standard PSO function for function optimization 
    Arguments:          iterations, type int 
                        ps, type int; this is the population size of your swarm 
    plots the trajectory of the swarms"""

    Particles = [Particle(10, 20, test_function, 0.2, 1.5, 1.5, 2, 2, [-100,100] ) for _ in range(ps)]  #initialize particles
    gy = Particles[np.random.randint(0,ps)].x       #initialize global best position by choosing random position of a particle in swarm 
    gy_fit = np.inf                                 #initialize global best fitness value by infinity, in case of maximization use -gy_fit

    
    for i in range(iterations):
        
        for p in Particles:         #iterate over particles

            p.evaluation()          #check for best values

            best_fitnesses = [p.py for p in Particles]      #stores the best fitness value that particles have known so far
            best_particle_index = np.argmin(best_fitnesses) #checks which particle has the best fitness of the above fitnesses
            best_particle = Particles[best_particle_index]  #selects the best particle of the swarm in the current iteration


            if np.any(best_fitnesses < gy_fit):         #updates the global best if the best particle of iteration has better values
                gy_fit = np.min(best_fitnesses)
                gy = best_particle.x

            p.update(gy, [-1,1], [-100,100])

            plt.plot(p.history) 

def Euclidean(dataloc, centroid_location):
    """ 
    Euclidean distance 
    Arguments       dataloc, type == type of position
                    centroid_location, type == type of centroid
                    
    Returns the sqrt of the dotproduct of the data/centroid matrices
    """
    return np.sqrt((dataloc-centroid_location) @ (dataloc-centroid_location).T)

def cluster_lab(data, centroids): 
    """
    Gets the cluster to where a datapoints belongs to
    Arguments       data, type == data
                    centroids, type = list
    Returns the cluster labels and the data matrix with Euclidean distance per cluster and datapoint 
    """
    grocery_list = np.zeros([len(data), len(centroids)])
    for i, d in enumerate(data):
        for cluster_index, centroid_location in enumerate(centroids): 
            grocery_list[i,cluster_index] = Euclidean(d, centroid_location) #calculate Euclidean distance
    cluster_labels = np.argmin(grocery_list, axis = 1) #creates list of cluster-labels per datapoint index
    return cluster_labels, grocery_list


def j_e(data, centroids, N_c):
    """
    Quantification error calculation 
    Arguments       data, type == data
                    centroids, type == n_dimensional list 
                    N_c, type = int; number of clusters 
    returns normalized fitness value and cluster labels in list
    """

    centroids = np.reshape(centroids, [N_c, data.shape[1]]) 

    cluster_labels, grocery_list = cluster_lab(data, centroids)
    
    #j_e value == fitness value == quantification_error 
    fitness_unnormalized = 0 
    for cluster_index in range(len(centroids)): 
        fitness_unnormalized += (np.sum(grocery_list[cluster_labels == cluster_index, cluster_index]) / np.sum(cluster_labels == cluster_index))
    fitness_normalized = fitness_unnormalized / len(centroids) #normalizes overall fitness value to make it comparable in between runs with different N_c
    return fitness_normalized, cluster_labels


def cluster(iterations, ps, Particles): 
    """
    Cluster algorithm adaptation of PSO 
    Arguments       iterations, type = int 
                    ps, type = int; population size
                    Particles, type = Class 'Particle' 
    Returns best position gy ;  the quantification errors in a list 
    """
    gy = Particles[np.random.randint(0,ps)].x
    gy_fit = np.inf
    quantification_error_track = []


    for i in tqdm(range(iterations)):       #use of tqdm for visual information on progress of algorithms
        for p in Particles:
            p.evaluation()

            best_fitnesses = np.array([p.py for p in Particles])
            best_particle_index = np.argmin(best_fitnesses)
            best_particle = Particles[best_particle_index]


            if np.any(best_fitnesses < gy_fit): 
                gy_fit = np.min(best_fitnesses)
                gy = best_particle.x

            p.update(gy, [-1,1], [-100,100])
        quantification_error_track.append(gy_fit)

    return gy, quantification_error_track











# %%

### EXPERIMENT STARTS HERE - Articial problem 1 :###

#data creation
data = np.random.uniform(-1,1, (400, 2))

#initializing parameters
N_c = 2 # number of clusters
ps = 10
Particles = [Particle(np.random.uniform(-1,1, (N_c, data.shape[1])).flatten(), #position
             0, #velocity
             lambda x: j_e(data, x, N_c), #objective function
             0.72, #weight
             1.49, #c1
             1.49, #c2
             1, #r1
             1, #r2
             [-1,1], #xlimit
             N_c) #number of clusters
              for _ in range(ps)]

#Experiment
gy, quantification_error_track_data = cluster(1000, ps, Particles) 
clabels, _ = cluster_lab(data, np.reshape(gy, [N_c, data.shape[1]]))



#%%
#plot the Quantification error value against iterations
plt.figure()
plt.title('Quantification error for PSO artificial problem 1 with 10 particles')
plt.plot(quantification_error_track_data)
plt.xlabel('# iterations')
plt.ylabel('Quantification error')
plt.savefig('pso_artificial_j.png')
plt.show()
#%%
#plot the eventual clustering
plt.figure()
plt.title('Clustering for artificial problem 1 PSO with 10 particles')
plt.scatter(data[:,0], data[:,1], c = clabels)
plt.legend(['cluster 1', 'cluster 2'])
plt.savefig('pso_artificial.png')
plt.show()

# %%
### EXPERIMENT 2 STARTS HERE - IRIS DATA SET ###

#prepare data
import pandas as pd
df=pd.read_csv('iris.data', sep=',',header=None)
data_iris = df.values
label_iris = data_iris[:,4]
data_iris = data_iris[:,:-1].astype(float)



# %%
#initialize parameters
N_c = 3 # number of clusters
ps = 10
Particles = [Particle(np.random.uniform(-1,1, (N_c, data_iris.shape[1])).flatten(), #position
            0, #velocity
            lambda x: j_e(data_iris, x, N_c), #objective function
            0.72, #weight
            1.49, #c1
            1.49, #c2
            1, #r1
            1, #r2
            [-1,1], #xlimit
            N_c) #number of clusters
            for _ in range(ps)]

#experiment
gy, quantification_error_track_irisdata = cluster(1000, ps, Particles) #with 1000 iterations and 10 particles
clabels, _ = cluster_lab(data_iris, np.reshape(gy, [N_c, data_iris.shape[1]]))

#plot the quantification error against the iterations
plt.figure()
plt.title('Quantification error for PSO iris data with 10 particles')
plt.plot(quantification_error_track_irisdata)
plt.xlabel('# iterations')
plt.ylabel('Quantification error')
plt.savefig('pso_iris_j.png')
plt.show()
print(clabels)


# %%

plt.figure()
plt.title('Clustering for Iris data K-means')
plt.scatter(data_iris[:,0], data_iris[:,1], c = clabels)
plt.savefig('pso_iris_1.png')
plt.show()
print(clabels)

plt.figure()
plt.title('Clustering for Iris data K-means')
plt.scatter(data_iris[:,1], data_iris[:,2], c = clabels)
plt.savefig('pso_iris_2.png')
plt.show()
print(clabels)