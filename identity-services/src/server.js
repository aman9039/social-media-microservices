require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./utils/logger");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require('rate-limit-redis');
const routes = require('./routes/identity-service');
const errorHandler = require('./middleware/errorHandler');
const connectionDB = require("./db/db");


const app = express();
const PORT = process.env.PORT || 3001 ;

// connect to mongodb
connectionDB();

const redisClient = new Redis(process.env.REDIS_URL);

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

// DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 5,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for Ip :${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    });
});

// Ip based rate limit for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Senstive endpoint rate limit exceeded for Ip :${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  // Redis store configuration
	store: new RedisStore({
	sendCommand: (...args) => redisClient.call(...args)
	}),
});


// apply this sensitiveEndpointsLimiter to our routes
app.use('/api/auth/register',sensitiveEndpointsLimiter);

// Routes
app.use('/api/auth',routes);

// error handler
app.use(errorHandler);

// listener
app.listen(PORT, () => {
    logger.info(`Identity service runing on port ${PORT}`)
});

// unhandled promise rejection
process.on("unhandledRejection",(reason,promise) => {
    logger.error("Unhandled Rejection at",promise,"reason:", reason)
});