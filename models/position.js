const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    total_time_offered: { type: Number, min: 0, required: true },
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
    deadline: { type: Date, default: Date.now },
    archived: { type: Boolean, default: false },
});

const Position = mongoose.model('Position', PositionSchema);

// User input validation
function validatePosition(project) {
    const schema = {
        name: Joi.string().required(),
        project: Joi.objectId().required(),
        total_time_offered: Joi.number().min(0).required(),
        expenses: Joi.array().items(Joi.objectId()),
        deadline: Joi.date(),
        archived: Joi.boolean(),
    };
    return Joi.validate(project, schema);
}

function validateExistingPosition(project) {
    const schema = {
        name: Joi.string(),
        project: Joi.objectId(),
        total_time_offered: Joi.number().min(0),
        expenses: Joi.array().items(Joi.objectId()),
        deadline: Joi.date(),
        archived: Joi.boolean(),
    };
    return Joi.validate(project, schema);
}

exports.Position = Position;
exports.validate = validatePosition;
exports.validateExisting = validateExistingPosition;
