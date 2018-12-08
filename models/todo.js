const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    briefing: {
        type: {
            title: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true }
        }
    },
    total_time_expected: { type: Number, min: 0, required: true },
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
    archived: { type: Boolean, default: false },
    assigned_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, default: Date.now },
    status: { type: Number, enum: [0,1,2,3], default: 0 }
});

const Todo = mongoose.model('Todo', todoSchema);

// User input validation
function validateTodo(todo) {
    const schema = {
        name: Joi.string().required(),
        position: Joi.objectId().required(),
        briefing: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required()
        }).required(),
        total_time_expected: Joi.number().min(0).required(),
        expenses: Joi.array().items(Joi.objectId()),
        archived: Joi.boolean(),
        assigned_users: Joi.array().items(Joi.objectId()),
        owner: Joi.objectId().required(),
        deadline: Joi.date(),
        status: Joi.number().valid(0,1,2,3)
    };
    return Joi.validate(todo, schema);
}

exports.Todo = Todo;
exports.validate = validateTodo;
