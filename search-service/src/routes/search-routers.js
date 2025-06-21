const express = require('express');
const {searchPostController} = require('../controller/search-controller');
const {} = require('../middleware/authMiddleware');
const authenticateRequest = require('../middleware/authMiddleware');
const searchPostLimiter = require('../middleware/rateLimit');

const router = express.Router();

router.use(authenticateRequest);

router.get('/posts',searchPostController);

module.exports = router;