const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    briefing: {
        type: {
            title: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true }
        }
    },
    total_time_offered: { type: Number, min: 0, required: true },
    todos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Todo' }],
    deadline: { type: Date, default: Date.now },
    archived: { type: Boolean, default: false }
});

const Position = mongoose.model('Position', PositionSchema);

// User input validation
function validatePosition(project) {
    const schema = {
        name: Joi.string().required(),
        project: Joi.objectId().required(),
        briefing: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required()
        }).required(),
        total_time_offered: Joi.number().min(0).required(),
        todos: Joi.array().items(Joi.objectId()),
        deadline: Joi.date(),
        archived: Joi.boolean()
    };
    return Joi.validate(project, schema);
}

exports.Position = Position;
exports.validate = validatePosition;
