const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, maxlength: 255 },
    surname: { type: String, required: true, maxlength: 255 },
    admin: { type: Boolean, default: false },
    email: { type: String, required: true, maxlength: 255, unique: true },
    archived: { type: Boolean, default: false },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Avatar' },
    password: { type: String, required: true, minlength: 6, maxlength: 1024 },
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, admin: this.admin }, config.get('jwtPrivateKey'));
    return token;
}

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
        password: Joi.string().min(6).max(255).required(),
        expenses: Joi.array().items(Joi.objectId())
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
        password: Joi.string().min(6).max(255),
        expenses: Joi.array().items(Joi.objectId()),
    };

    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
exports.validateExisting = validateExistingUser;
