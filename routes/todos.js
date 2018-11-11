const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Todo, validate} = require('../models/todo');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const populateConfig = [
    {
        path: 'assigned_users',
        select: 'first_name surname archived avatar',
        populate: {
            path: 'avatar',
            select: 'url'
        }
    },
    {
        path: 'owner',
        select: 'first_name surname archived avatar',
        populate: {
            path: 'avatar',
            select: 'url'
        }
    },
    {
        path: 'expenses',
        populate: {
            path: 'user',
            select: 'first_name surname archived avatar',
            populate: {
                path: 'avatar',
                select: 'url'
            }
        }
    }
];

router.get('/', async (req, res) => {
    const todos = await Todo
        .find()
        .populate(populateConfig)
        .sort('name');
    res.send(todos);
});

router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('The given ID was not a valid ObjectID.');
    const todo = await Todo
        .findById(req.params.id)
        .populate(populateConfig);
    if (!todo) return res.status(404).send('The todo with the given ID was not found.');
    res.send(todo);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let todo = new Todo(req.body);
    todo = await todo.save();
    res.send(todo);
});

router.put('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('The given ID was not a valid ObjectID.');
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!todo) return res.status(404).send('The todo with the given ID was not found.');
    res.send(todo);
});

router.delete('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('The given ID was not a valid ObjectID.');
    const todo = await Todo.findByIdAndUpdate(req.params.id, { archived: true }}, { new: true });
    if (!todo) return res.status(404).send('The todo with the given ID was not found.');
    res.send(todo);
});


module.exports = router;
