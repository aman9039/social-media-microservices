const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const Post = require("../models/post");

async function invalidatePostCache(req, input) {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

const createPost = async (req, res) => {
  logger.info("Create post endpoint hit...");
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
    await invalidatePostCache(req, newlyCreatedPost._id.toString());
    logger.info("Post created :", newlyCreatedPost);
    res.status(201).json({
      success: true,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page} : ${limit}`;

    // check cachkey available in redis
    const cachedPosts = await req.redisClient.get(cacheKey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    // access data from mongoDB
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNoOfPosts = await Post.countDocuments();

    const result = {
      posts,
      currentpage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    };

    // save your posts in redis cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    res.json({ result });
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
    const postId = req.params.id;
    const cachekey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cachekey);

    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const singlePostById = await Post.findById(postId);

    if (!singlePostById) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await req.redisClient.setex(
      cachedPost,
      3600,
      JSON.stringify(singlePostById)
    );

    res.json(singlePostById);
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
   
    const post = await Post.findOneAndDelete({
      _id : req.params.id,
      user : req.user.userId
    });
  
   if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    };

    await invalidatePostCache(req,req.params.id);
    res.status(200).json({
      success : true,
      message : 'Post deleted successfully',
    });







    // const postId = req.params.id;

    // // check if post exist
    // const post = await Post.findById(postId);

    // if (!post) {
    //   res.status(404).json({
    //     success: false,
    //     message: 'Post not found',
    //   });
    // }

    // // Delete the post
    // await Post.findByIdAndDelete(postId);

    // Invalidate Redis cache
    await invalidatePostCache(req);

    logger.info(`Post Deleted successful:${postId}`);
    res.status(200).json({
      success : true,
      message : "Post Deleted successful"
    });
  } catch (error) {
    logger.error("Error delete post :", error);
    res.status(500).json({
      success: false,
      message: "Error delete post",
    });
  }
};

module.exports = { createPost, deletePost, getAllPosts, getPost };
