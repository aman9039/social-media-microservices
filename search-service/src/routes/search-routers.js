const express = require('express');
const {searchPostController} = require('../controller/search-controller');
const authenticateRequest = require('../middleware/authMiddleware');
const searchPostLimiter = require('../middleware/rateLimit');

const router = express.Router();

router.use(authenticateRequest);

router.get('/posts',searchPostLimiter,searchPostController);

module.exports = router;