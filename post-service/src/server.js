require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const Redis = require("ioredis");
const connectDb = require("./Db/db");
const cors = require("cors");
const postRoutes = require("./routes/post-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3002;

// mongoDB connection
connectDb();

// redis client
const redisClient = new Redis(process.env.REDIS_URL);

// middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body , ${req.body}`);
  next();
});

// routes -> pass redisclient to routes
app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service runing on port ${PORT}`);
});

// unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
