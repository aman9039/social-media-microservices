require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mediaRoutes = require("./routes/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const connectDb = require("./Db/db");
const Redis = require("ioredis");
const { uploadMediaEndPoint } = require("./middleware/rateLimit");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlerPostDeleted } = require("./eventHandler/media-event-handler");

const app = express();
const PORT = process.env.PORT || 3003;

// connect to mongodb
connectDb();

// middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body,${req.body}`);
  next();
});

// implement Ip based rate limiting for sensitive endpoint
// app.use('/api/media/upload',uploadMediaEndPoint);

app.use("/api/media", mediaRoutes);
app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    // consume all the events
    await consumeEvent("post.deleted", handlerPostDeleted);
   
    app.listen(PORT, () => {
      logger.info(`Media service runing on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();
// unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
