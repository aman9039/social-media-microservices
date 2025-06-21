require("dotenv").config();
const express = require("express");
const logger = require("./utils/logger");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middleware/errorHandler");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const connectDb = require("./db/db");
const searchRoutes = require('./routes/search-routers');
const { handlePostCreated, handlePostDeleted } = require('./eventHandlers/search-event-handlers');

const app = express();
const PORT = process.env.PORT || 3004;

// connect to mongodb
connectDb();

// redis client
const redisClient = new Redis(process.env.REDIS_URL);

// middleware
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(errorHandler);

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
 logger.info(`Request body: ${JSON.stringify(req.body)}`);
 next();
});

// routes -> pass redisclient to routes
app.use(
  "/api/search",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  searchRoutes
);



app.use('/api/search',searchRoutes);

async function startServer(){
  try {
    await connectToRabbitMQ();
    
    // consume the event / subscribe to the events 
   
    await consumeEvent('post.created',handlePostCreated);
    await consumeEvent('post.deleted',handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Search service runing on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error,'Failed to start search service');
    process.exit(1);
  }
};

startServer();