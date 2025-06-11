const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");
const logger = require("../utils/logger");

// Redis client
const redisClient = new Redis(process.env.REDIS_URL);

// createPost: Allow 10 requests every 5 minutes
const createPostLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`createPost limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many create post requests." });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// getPost: Allow 5 requests every 1 minute
const getPostLimiter = rateLimit({
  windowMs:5 * 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`getPost limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many get post requests." });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// getAllPosts: Allow 10 requests per minute
const getAllPostsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`getAllPosts limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests to fetch all posts." });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// deletePost: Allow 3 requests per 10 minutes
const deletePostLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`deletePost limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many delete requests." });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

module.exports = {
  createPostLimiter,
  getPostLimiter,
  getAllPostsLimiter,
  deletePostLimiter,
};
