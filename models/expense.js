const Joi = require('joi');
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recorded_time: { type: Number },
    affected_date: { type: Date, default: Date.now },
    comment: { type: String },
    archived: { type: Boolean, default: false }
});

const Expense = mongoose.model('Expense', ExpenseSchema);

// User input validation
function validateExpense(expense) {
    const schema = {
        user: Joi.objectId().required(),
        recorded_time: Joi.number().required(),
        affected_date: Joi.date(),
        comment: Joi.string().required(),
        archived: Joi.boolean()
    };
    return Joi.validate(expense, schema);
}

exports.Expense = Expense;
exports.validate = validateExpense;
