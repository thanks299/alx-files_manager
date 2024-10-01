import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Create Redis client and connect
    this.client = createClient();

    // Promisify Redis methods for async/await
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

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
      const value = await this.getAsync(key);
      return value;
    } catch (error) {
      console.error('Error getting key from Redis:', error);
      return null;
    }
  }

  // Set key with a value and expiration time in seconds
  async set(key, value, duration) {
    try {
      await this.setAsync(key, value, 'EX', duration);
    } catch (error) {
      console.error('Error setting key in Redis:', error);
    }
  }

  // Delete key from Redis
  async del(key) {
    try {
      await this.delAsync(key);
    } catch (error) {
      console.error('Error deleting key from Redis:', error);
    }
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

