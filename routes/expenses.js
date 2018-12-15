const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Expense, validate, validateExisting} = require('../models/expense');
const {Project} = require('../models/project');
const {Position} = require('../models/position');
const oIdValidator = require('../middleware/oIdValidator');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const populateConfig = [
    {
        path: 'project',
        select: 'name archived briefing total_time expected start deadline',
    },
    {
        path: 'user',
        select: 'first_name surname archived'
    }
];

router.get('/', [auth], async (req, res) => {
    let expenses = await Expense
        .find()
        .populate(populateConfig)
        .sort('affected_date');

    if (!expenses) return res.status(404).send('No expenses found.');

    // return only projects that are assigned to the user,
    // if user is not admin
    if (!req.user.admin) {
        expenses = expenses.filter((expense) => {
            if (expense.user._id == req.user._id) return true;
        });

        if(!expenses.length) return res.status(404).send('No expenses found with your user id.');
    }

    res.send(expenses);
});

router.get('/:id', [auth, oIdValidator], async (req, res) => {
    let expense = await Expense
        .findById(req.params.id)
        .populate(populateConfig);

    if (!expense) return res.status(404).send('The expense with the given ID was not found.');

    // return only projects that are assigned to the user,
    // if user is not admin
    if (!req.user.admin) {
        if (expense.user._id != req.user._id) return res.status(404).send('Access denied. You are not the owner.');
    }

    res.send(expense);
});

router.post('/', [auth], async (req, res) => {
    // delete manually set user id from request
    delete req.body.user;

    // add user id to post request from jwt payload
    req.body.user = req.user._id;

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let expense = new Expense(req.body);
    expense = await expense.save();

    // push new expense into position
    const expenseID = expense._id;

    const projectID = req.body.project;
    const project = await Project.findById(projectID);
    if (!project) {
        expense = await Expense.findByIdAndDelete(expenseID);
        return res.status(404).send('The project with the given ID was not found.');
    }

    const positionID = req.body.position;
    let position = await Position.findByIdAndUpdate(positionID, {$push: {expenses: expenseID}});
    if (!position) {
        expense = await Expense.findByIdAndDelete(expenseID);
        return res.status(404).send('The position with the given ID was not found.');
    }

    res.send(expense);
});

router.put('/:id', [auth, oIdValidator], async (req, res) => {
    // delete manually set user id from request
    delete req.body.user;

    // add user id to post request from jwt payload
    req.body.user = req.user._id;

    // validate user input
    const { error } = validateExisting(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check for existing expense
    let expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).send('The expense with the given ID was not found.');

    // check ownership
    if (expense.user != req.user._id) return res.status(403).send('Access denied. You are not the owner.');

    // update db
    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(expense);
});

router.delete('/:id', [auth, oIdValidator], async (req, res) => {
    let expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).send('The expense with the given ID was not found.');

    // check ownership
    if (expense.user != req.user._id) return res.status(403).send('Access denied. You are not the owner.');

    expense = await Expense.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    res.send(expense);
});

module.exports = router;
