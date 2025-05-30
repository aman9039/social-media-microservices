const mongoose = require('mongoose');
const logger = require('../utils/logger');
const connectDb = async () => {
    try {
       await mongoose.connect(process.env.MONGO_URL); 
       logger.info('mongoDb is connected...')
    } catch (error) {
        logger.error('error in mongoose :', error);
        
    }
};

module.exports = connectDb;