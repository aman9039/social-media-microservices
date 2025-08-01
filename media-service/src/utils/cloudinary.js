const cloudinary = require('cloudinary').v2;
const { error } = require('winston');
const logger = require('./logger');

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY ,
    api_secret : process.env.API_SECRET ,
});

const uploadMediaToCloudinary = (file) => {
    return new Promise ((resolve,reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type : "auto"
            },
            (error,result) => {
                if(error){
                    logger.error('Error while uploading media to cloudernary',error);
                    reject(error);
                } else {
                 resolve(result)
                };
            },
        )

        uploadStream.end(file.buffer);
    });
};

const deleteMediaFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        logger.error('Error deleting media from cloudinary');
        throw error;
    }
};

module.exports = { uploadMediaToCloudinary , deleteMediaFromCloudinary };