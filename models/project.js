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
    ressources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ressource' }],
    positions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Position' }],
    todos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Todo' }],
    assigned_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    start: { type: Date, default: Date.now },
    deadline: { type: Date, default: Date.now },
    total_time_offered: { type: Number, min: 0, required: true },
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
        project_managers: Joi.array().items(Joi.objectId()),
        ressources: Joi.array().items(Joi.objectId()),
        positions: Joi.array().items(Joi.objectId()),
        todos: Joi.array().items(Joi.objectId()),
        assigned_users: Joi.array().items(Joi.objectId()),
        start: Joi.date(),
        deadline: Joi.date(),
        total_time_offered: Joi.number().min(0).required(),
        archived: Joi.boolean()
    };
    return Joi.validate(project, schema);
}

function validateExistingProject(project) {
    const schema = {
        name: Joi.string(),
        briefing: Joi.object({
            title: Joi.string(),
            description: Joi.string()
        }),
        project_managers: Joi.array().items(Joi.objectId()),
        ressources: Joi.array().items(Joi.objectId()),
        positions: Joi.array().items(Joi.objectId()),
        todos: Joi.array().items(Joi.objectId()),
        assigned_users: Joi.array().items(Joi.objectId()),
        start: Joi.date(),
        deadline: Joi.date(),
        total_time_offered: Joi.number().min(0),
        archived: Joi.boolean()
    };
    return Joi.validate(project, schema);
}

exports.Project = Project;
exports.validate = validateProject;
exports.validateExisting = validateExistingProject;
