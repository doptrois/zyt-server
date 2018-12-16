const Joi = require('joi');
const mongoose = require('mongoose');

const AvatarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
    },
    archived: {
        type: Boolean,
        default: false,
    },
});

const Avatar = mongoose.model('Avatar', AvatarSchema);

// User input validation
function validateAvatar(avatar) {
    const schema = {
        name: Joi.string().required(),
        url: Joi.string().required(),
        archived: Joi.boolean(),
    };
    return Joi.validate(avatar, schema);
}

exports.Avatar = Avatar;
exports.validate = validateAvatar;
