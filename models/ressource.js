const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const ressourceSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Project' },
    assigned_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    start: { type: Date, default: Date.now },
    stop: { type: Date, default: Date.now },
    total_time_expected: { type: Number, min: 0, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    archived: { type: Boolean, default: false }
});

const Ressource = mongoose.model('Ressource', ressourceSchema);

// User input validation
function validateRessource(ressource) {
    const schema = {
        project: Joi.objectId().required(),
        assigned_users: Joi.array().items(Joi.objectId().required()).required(),
        start: Joi.date(),
        stop: Joi.date(),
        total_time_expected: Joi.number().min(0).required(),
        owner: Joi.objectId().required(),
        archived: Joi.boolean()
    };
    return Joi.validate(ressource, schema);
}

exports.Ressource = Ressource;
exports.validate = validateRessource;
