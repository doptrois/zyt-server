const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Expense, validate} = require('../models/expense');
const oIdValidator = require('../middleware/oIdValidator');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const populateConfig = [
    {
        path: 'user',
        select: 'first_name surname archived avatar',
        populate: {
            path: 'avatar',
            select: 'url'
        }
    }
];

router.get('/', [auth], async (req, res) => {
    const expenses = await Expense
        .find()
        .populate(populateConfig)
        .sort('affected_date');
    res.send(expenses);
});

router.get('/:id', [auth, oIdValidator], async (req, res) => {
    const expense = await Expense
        .findById(req.params.id)
        .populate(populateConfig);
    if (!expense) return res.status(404).send('The expense with the given ID was not found.');
    res.send(expense);
});

router.post('/', [auth], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let expense = new Expense(req.body);
    expense = await expense.save();
    res.send(expense);
});

router.put('/:id', [auth, oIdValidator], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).send('The expense with the given ID was not found.');
    res.send(expense);
});

router.delete('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const expense = await Expense.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!expense) return res.status(404).send('The expense with the given ID was not found.');
    res.send(expense);
});

module.exports = router;
