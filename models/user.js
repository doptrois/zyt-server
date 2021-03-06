const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        maxlength: 255,
        required: true,
    },
    surname: {
        type: String,
        maxlength: 255,
        required: true,
    },
    admin: {
        type: Boolean,
        default: false,
    },
    email: {
        type: String,
        maxlength: 255,
        unique: true,
        required: true,
    },
    archived: {
        type: Boolean,
        default: false,
    },
    avatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Avatar',
    },
    password: {
        type: String,
        minlength: 6,
        maxlength: 1024,
        required: true,
    },
    expenses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
    }],
});

userSchema.methods.generateAuthToken = function genAuthToken() {
    const token = jwt.sign({ _id: this._id, admin: this.admin }, config.get('jwtPrivateKey'));
    return token;
};

const User = mongoose.model('User', userSchema);

// User input validation
function validateUser(user) {
    const schema = {
        first_name: Joi.string().max(255).required(),
        surname: Joi.string().max(255).required(),
        admin: Joi.boolean(),
        email: Joi.string().max(255).required().email(),
        archived: Joi.boolean(),
        avatar: Joi.objectId().required(),
        password: Joi.string().min(1).max(50).required(),
        expenses: Joi.array().items(Joi.objectId()),
    };

    return Joi.validate(user, schema);
}

// User input validation
function validateExistingUser(user) {
    const schema = {
        first_name: Joi.string().max(255),
        surname: Joi.string().max(255),
        admin: Joi.boolean(),
        email: Joi.string().max(255).email(),
        archived: Joi.boolean(),
        avatar: Joi.objectId(),
        password: Joi.string().min(1).max(50),
        expenses: Joi.array().items(Joi.objectId()),
    };

    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
exports.validateExisting = validateExistingUser;
