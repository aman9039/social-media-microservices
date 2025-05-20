const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { error } = require("winston");

const connectionDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    logger.info("Connected to mongoDB")
  } catch (error) {
    logger.error("MongoDB connection error", error);
  }
}




module.exports = connectionDB;