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
const { connectToRabbitMQ } = require("./utils/rabbitmq");

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

async function startServer() {
  try {
    await connectToRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Post service runing on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to server',error);
    process.exit(1);
  }
};

startServer();

// unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
