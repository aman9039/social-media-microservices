const logger = require("../utils/logger");
const Search = require("../models/searchPost");

// async function invalidatePostCache(req, input) {
//   const cachedKey = `post:${input}`;
//   await req.redisClient.del(cachedKey);

//   const keys = await req.redisClient.keys("posts:search:*");
//   if (keys.length > 0) {
//     await req.redisClient.del(keys);
//   }
// }

// implement caching 2 to 5 mint 
const searchPostController = async (req, res) => {
  logger.info("Search endpoint hit!");
  
  try {
    const { query } = req.query;
    const results = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
      
      
      res.status(200).json(results);
  } catch (error) {
    logger.error("Error while searching post", error);
    res.status(500).json({
      success: false,
      message: "Error while searching post",
    });
  }
};

module.exports = { searchPostController };