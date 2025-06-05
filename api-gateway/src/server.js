require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./utils/logger");
const proxy = require("express-http-proxy");
const { error } = require("winston");
const  errorHandler  = require("./middleware/errorHandle");
const { validateToken } = require("./middleware/authmiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

// rate limiting
const rateLimitOptions = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Senstive endpoint rate limit exceeded for Ip :${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  // Redis store configuration
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(rateLimitOptions);

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
logger.info(`Request body: ${JSON.stringify(req.body)}`);

  next();
});

// proxy
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandle: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: `Internal server error`,
      error: err.message,
    });
  },
};

// setting up proxy for our identity service

app.use(
  "/v1/auth",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Identity service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up proxy for our post service
app.use('/v1/posts',validateToken,proxy(process.env.POST_SERVICE_URL,
  {
    ...proxyOptions,
    proxyReqOptDecorator : (proxyReqOpts,srcReq) => {
    proxyReqOpts.headers['Content-Type'] = 'application/json';
    proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;

    return proxyReqOpts
    },
     userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  }
))


app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway is running ${PORT}`);
  logger.info(
    `Identity service is running ${process.env.IDENTITY_SERVICE_URL} `
  );
  logger.info(
    `Post service is running ${process.env.POST_SERVICE_URL} `
  );
  logger.info(`Redis url ${process.env.REDIS_URL}`);
});
