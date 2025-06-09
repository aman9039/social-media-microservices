const Joi = require('joi');

const validateCreatePost = (data) => {
    const schema = Joi.object({
        content : Joi.string().min(3).max(50).required(),
      media: Joi.array(),

    });
    return schema.validate(data);
};


module.exports = { validateCreatePost };