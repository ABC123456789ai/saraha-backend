import { redisClient } from "../config/redis.js";

const set = async (key, value, options = {}) => {
  return await redisClient.set(key, value, options);
};

const get = async (key) => {
  return await redisClient.get(key);
};

const del = async (key) => {
  return await redisClient.del(key);
};

const incr = async (key) => {
  return await redisClient.incr(key);
};

export {
  set,
  get,
  del,
  incr,
};