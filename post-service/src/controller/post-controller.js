const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const Post = require('../models/post');

const createPost = async (req, res) => {
  logger.info('Create post endpoint hit...')
  try {
    // validate the schema
        const { error } = validateCreatePost(req.body);
        if (error) {
          logger.warn("Validate error", error.details[0].message);
          return res.status(400).json({
            success: false,
            message: error.details[0].message,
          });
        }


    const { content, media } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      media: media || [],
    });

    await newlyCreatedPost.save();
    logger.info("Post created :", newlyCreatedPost);
    res.status(201).json({
      success: false,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error("Error create post :", error);
    res.status(500).json({
      success: false,
      message: "Error create post",
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
     const { content, media } = req.body;
  } catch (error) {
    logger.error("Error get all post :", error);
    res.status(500).json({
      success: false,
      message: "Error get all post",
    });
  }
};
const getPost = async (req, res) => {
  try {
     const { content, media } = req.body;
  } catch (error) {
    logger.error("Error get post :", error);
    res.status(500).json({
      success: false,
      message: "Error get post",
    });
  }
};
const deletePost = async (req, res) => {
  try {
     const { content, media } = req.body;
  } catch (error) {
    logger.error("Error delete post :", error);
    res.status(500).json({
      success: false,
      message: "Error delete post",
    });
  }
};

module.exports = { createPost,deletePost,getAllPosts,getPost };
