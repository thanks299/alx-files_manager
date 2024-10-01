import { promisify } from "redis";

class RedisClient {
  constructor() {
    // Create Redis client and connect
    this.createRedis();
    }

  async createRedis() {
	  this.client = createClient();
	  this.client.on('error', (err) => console.error('Redis Client Error:', error));
	  
	  try {
		  await this.client.connect();
	  } catch (error) {
		  console.error('Redis client connected to the server', error);
	  }
  }

    // Handle connection error
    this.client.on('error', (error) => {
      console.error('Redis client not connected to the server:', error);
    });

    // Connect to Redis server
    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });
  }

  // Check if Redis connection is alive
  isAlive() {
    return this.client.connected;
  }

  // Get value of a key
  async get(key) {
	  try {
		  const value = await this.client.get(key);
		  return value;
	  } catch (error) {
		  console.error('Error getting key from Redis:', error);
		  return null;
	  }
  }

  // Set key with a value and expiration time in seconds
  async set(key, value, duration) {
	  try {
		  await this.client.get(key, value, {
			  'EX', duration});
	  } catch (error) {
		  console.error('Error setting key in Redis:', error);
	  }
  }

  // Delete key from Redis
  async del(key) {
	  try {
		  await this.client.del(key);
	  } catch (error) {
		  console.error('Error deleting key from Redis:', error);
	  }
  } 

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

