const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recorded_time: { type: Number, min: 0, required: true },
    affected_date: { type: Date, default: Date.now },
    comment: { type: String, required: true },
    archived: { type: Boolean, default: false }
});

const Expense = mongoose.model('Expense', ExpenseSchema);

// User input validation
function validateExpense(expense) {
    const schema = {
        user: Joi.objectId().required(),
        recorded_time: Joi.number().min(0).required(),
        affected_date: Joi.date(),
        comment: Joi.string().required(),
        archived: Joi.boolean()
    };
    return Joi.validate(expense, schema);
}

exports.Expense = Expense;
exports.validate = validateExpense;
