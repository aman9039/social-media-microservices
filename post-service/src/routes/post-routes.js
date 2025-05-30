const express = require("express");
const router = express.Router();
const  authenticateRequest  = require('../middleware/authMiddleware');

const {
  createPost,
  getPost,
  getAllPosts,
  deletePost,
} = require("../controller/post-controller");

const {
  createPostLimiter,
  getPostLimiter,
  getAllPostsLimiter,
  deletePostLimiter,
} = require("../middleware/rateLimiter");



// middleware -> this will tell if the user is an auth user or not 
router.use(authenticateRequest);


// Apply different rate limiters
router.post("/create-post", createPostLimiter, createPost);
router.get("/:id", getPostLimiter, getPost);
router.get("/", getAllPostsLimiter, getAllPosts);
router.delete("/:id", deletePostLimiter, deletePost);

module.exports = router;