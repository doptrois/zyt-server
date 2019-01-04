const express = require('express');
const auth = require('../middleware/auth');
const { Expense, validate, validateExisting } = require('../models/expense');
const { Project } = require('../models/project');
const { Position } = require('../models/position');
const { User } = require('../models/user');
const oIdValidator = require('../middleware/oIdValidator');
const router = express.Router();

const populateConfig = [
    {
        path: 'project',
        select: 'name archived briefing total_time expected start deadline',
    },
    {
        path: 'user',
        select: 'first_name surname archived',
    },
    {
        path: 'position',
        select: '-expenses',
    },
];

router.get('/', [auth], async (req, res) => {
    let expenses = await Expense
        .find()
        .populate(populateConfig)
        .sort('affected_date');

    if (!expenses) return res.status(404).send('No expenses found.');

    // return only expenses that are assigned to the user,
    // if user is not admin
    if (!req.user.admin) {
        expenses = expenses.filter((expense) => {
            if (expense.user._id == req.user._id) return true;
            return false;
        });

        if (!expenses.length) return res.status(404).send('No expenses found with your user id.');
    }

    return res.send(expenses);
});

router.get('/week', [auth], async (req, res) => {
    let expenses = await Expense
        .find()
        .populate(populateConfig)
        .sort('affected_date');

    if (!expenses) return res.status(404).send('No expenses found.');

    // return only expenses that are assigned to the user,
    // if user is not admin
    if (!req.user.admin) {
        expenses = expenses.filter((expense) => {
            if (expense.user._id == req.user._id) return true;
            return false;
        });

        if (!expenses.length) return res.status(404).send('No expenses found with your user id.');
    }

    // Filter by week
    const curr = new Date();
    let first = curr.getDate() - curr.getDay();
    first += 1;
    const last = first + 6;

    const mon = new Date(curr.setDate(first));
    const sun = new Date(curr.setDate(last));

    const currentYear = new Date();

    if (mon.getFullYear() < currentYear.getFullYear()) {
        sun.setFullYear(currentYear.getFullYear());
    }

    expenses = expenses.filter((expense) => {
        const date = new Date(expense.affected_date);
        return (date >= mon && date <= sun);
    });

    if (!expenses.length) {
        const humanDateMondayLong = mon.toLocaleDateString('de-DE', { weekday: 'long' }).toUpperCase();
        const humanDateSundayLong = sun.toLocaleDateString('de-DE', { weekday: 'long' }).toUpperCase();

        const humanDateMonday = `${humanDateMondayLong} ${(mon.getDate())}.${(mon.getMonth() + 1)}.${(mon.getFullYear())}`;
        const humanDateSunday = `${humanDateSundayLong} ${(sun.getDate())}.${(sun.getMonth() + 1)}.${(sun.getFullYear())}`;
        return res.status(404).send(`No expenses found for the week from ${humanDateMonday} to ${humanDateSunday}.`);
    }

    return res.send(expenses);
});

router.get('/:id', [auth, oIdValidator], async (req, res) => {
    const expense = await Expense
        .findById(req.params.id)
        .populate(populateConfig);

    if (!expense) return res.status(404).send('The expense with the given ID was not found.');

    // return only epxpense that is assigned to the user,
    // if user is not admin
    if (!req.user.admin) {
        if (expense.user._id != req.user._id) return res.status(404).send('Access denied. You are not the owner.');
    }

    return res.send(expense);
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

    // push new expense into project
    const expenseID = expense._id;

    const projectID = req.body.project;
    const project = await Project.findByIdAndUpdate(projectID, { $push: { expenses: expenseID } });
    if (!project) {
        expense = await Expense.findByIdAndDelete(expenseID);
        return res.status(404).send('Project not found');
    }

    // push new expense into user
    const user = await User.findByIdAndUpdate(req.body.user, { $push: { expenses: expenseID } });
    if (!user) {
        expense = await Expense.findByIdAndDelete(expenseID);
        return res.status(404).send('User not found');
    }

    // push new expense into position
    const positionID = req.body.position;
    const position = await Position.findByIdAndUpdate(positionID, { $push: { expenses: expenseID } });
    if (!position) {
        expense = await Expense.findByIdAndDelete(expenseID);
        return res.status(404).send('The position with the given ID not found');
    }

    return res.send(expense);
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
    return res.send(expense);
});

router.delete('/:id', [auth, oIdValidator], async (req, res) => {
    let expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).send('The expense with the given ID was not found.');

    // check ownership
    if (expense.user != req.user._id) return res.status(403).send('Access denied. You are not the owner.');

    expense = await Expense.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    return res.send(expense);
});

module.exports = router;
