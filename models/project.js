const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    briefing: {
        type: {
            title: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true }
        }
    },
    project_managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    positions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Position' }],
    assigned_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    start: { type: Date, default: Date.now },
    deadline: { type: Date, default: Date.now },
    archived: { type: Boolean, default: false }
});

const Project = mongoose.model('Project', projectSchema);

// User input validation
function validateProject(project) {
    const schema = {
        name: Joi.string().required(),
        briefing: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required()
        }).required(),
        project_manager: Joi.array().items(Joi.objectId()),
        positions: Joi.array().items(Joi.objectId()),
        start: Joi.date(),
        deadline: Joi.date(),
        archived: Joi.boolean()
    };
    return Joi.validate(project, schema);
}

exports.Project = Project;
exports.validate = validateProject;
