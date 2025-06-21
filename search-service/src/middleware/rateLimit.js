const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");
const logger = require("../utils/logger");

// Redis client
const redisClient = new Redis(process.env.REDIS_URL);

// createPost: Allow 10 requests every 5 minutes
const searchPostLimiter = rateLimit({
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

module.exports = searchPostLimiter ;
