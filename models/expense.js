const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
    recorded_time: { type: Number, min: 0, required: true },
    affected_date: { type: Date, default: Date.now },
    comment: { type: String, required: true },
    archived: { type: Boolean, default: false },
});

const Expense = mongoose.model('Expense', ExpenseSchema);

// User input validation
function validateExpense(expense) {
    const schema = {
        user: Joi.objectId().required(),
        project: Joi.objectId().required(),
        position: Joi.objectId().required(),
        recorded_time: Joi.number().min(0).required(),
        affected_date: Joi.date(),
        comment: Joi.string().required(),
        archived: Joi.boolean(),
    };
    return Joi.validate(expense, schema);
}

function validateExistingExpense(expense) {
    const schema = {
        user: Joi.objectId(),
        project: Joi.objectId(),
        position: Joi.objectId(),
        recorded_time: Joi.number().min(0),
        affected_date: Joi.date(),
        comment: Joi.string(),
        archived: Joi.boolean(),
    };
    return Joi.validate(expense, schema);
}

exports.Expense = Expense;
exports.ExpenseSchema = ExpenseSchema;
exports.validate = validateExpense;
exports.validateExisting = validateExistingExpense;
