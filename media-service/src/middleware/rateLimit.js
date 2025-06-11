const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");
const logger = require("../utils/logger");

// Redis client
const redisClient = new Redis(process.env.REDIS_URL);

// implement Ip based rate limiting for sensitive endpoint
const uploadMediaEndPoint = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`uploadMedia limit exceeded for IP: ${req.ip}`);
    res
      .status(429)
      .json({ success: false, message: "Too many upload requests." });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

module.exports = { uploadMediaEndPoint };
