const Media = require("../models/media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");
const handlerPostDeleted = async (event) => {
  console.log(event, "eventEvent");
  const { postId, media } = event;
  try {
    const mediaToDelete = await Media.find({ _id: { $in: media } });

    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(
        `Delete media ${media._id} associated with this deleted post ${postId}`
      );
      console.log("delete media from cloudinary");
    }

    logger.info(`Processed deletion of media for post id ${postId}`);
  } catch (error) {
    logger.error(error, "Error occured while media deletaion");
  }
};

module.exports = { handlerPostDeleted };
