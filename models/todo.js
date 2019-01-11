const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    briefing: {
        type: {
            title: {
                type: String,
                trim: true,
                required: true,
            },
            description: {
                type: String,
                trim: true,
                required: true,
            },
        },
    },
    archived: {
        type: Boolean,
        default: false,
    },
    assigned_users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: Number,
        enum: [0, 1, 2, 3],
        default: 0,
    },
});

const Todo = mongoose.model('Todo', todoSchema);

// User input validation
function validateTodo(todo) {
    const schema = {
        project: Joi.objectId().required(),
        briefing: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
        }).required(),
        archived: Joi.boolean(),
        assigned_users: Joi.array().items(Joi.objectId()),
        status: Joi.number().valid(0, 1, 2, 3),
    };
    return Joi.validate(todo, schema);
}

function validateExistingTodo(todo) {
    const schema = {
        project: Joi.objectId(),
        briefing: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
        }),
        archived: Joi.boolean(),
        assigned_users: Joi.array().items(Joi.objectId()),
        status: Joi.number().valid(0, 1, 2, 3),
    };
    return Joi.validate(todo, schema);
}

exports.Todo = Todo;
exports.validate = validateTodo;
exports.validateExisting = validateExistingTodo;
