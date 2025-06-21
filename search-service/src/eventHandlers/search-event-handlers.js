const logger = require("../utils/logger");
const Search = require("../models/searchPost");

async function handlePostCreated(event) {
  try {
    console.log("handlePostCreated: event", event);

    const newSearchPost = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
    });

    await newSearchPost.save();
    logger.info(
      `Search post created: ${event.postId}, ${newSearchPost._id.toString()}`
    );
  } catch (error) {
    logger.error(error, "Error handling post creation event");
  }
}

async function handlePostDeleted(event) {
  try {
    await Search.findOneAndDelete({ postId: event.postId });
    logger.info(`Search post deleted: ${event.postId}`);
  } catch (error) {
    logger.error(error, "Error handling post deletion event");
  }
}

module.exports = { handlePostCreated, handlePostDeleted };
