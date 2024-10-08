import { promisify } from "util";
import { createClient } from "redis";

class RedisClient {
  constructor() {
    // Create Redis client and connect
    this.createRedis();
  }

  async createRedis() {
    this.client = createClient();

    this.client.on('error', (err) => console.error('Redis client error:', err));

    this.client.on('ready', () => console.log('Redis client connected to the server'));
  }

  // Check if Redis connection is alive
  isAlive() {
    return this.client.connected;
  }

  // Get value of a key
  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    const value = await getAsync(key);
    return value;
  }

  // Set key with a value and expiration time in seconds
  async set(key, value, duration) {
    const setExAsync = promisify(this.client.setex).bind(this.client);
    await setExAsync(key, duration, value);
  }

  // Delete key from Redis
  async del(key) {
    const delAsync = promisify(this.client.del).bind(this.client);
    await delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
