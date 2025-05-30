const logger = require('../utils/logger');

const authenticateRequest = (req,res,next) => {
    const userId = req.headers['x-user-id'];
    console.log(userId);
    

    if(!userId){
        logger.warn(`Access attempted without user ID`)
        return res.status(401).json({
            success : false,
            message : 'Authentication required! Please login to contiune' 
        });
    };
    req.user = { userId };
    next();
};

module.exports = authenticateRequest;