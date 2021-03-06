const express = require('express');
const auth = require('../middleware/auth');
const { Todo, validate, validateExisting } = require('../models/todo');
const { Project } = require('../models/project');
const oIdValidator = require('../middleware/oIdValidator');
const router = express.Router();

const populateConfig = [
    {
        path: 'assigned_users',
        select: 'first_name surname archived',
    },
];

router.get('/', [auth], async (req, res) => {
    const todos = await Todo
        .find()
        .select()
        .populate(populateConfig)
        .sort('deadline');

    if (!todos) return res.status(404).send('No todos found.');

    return res.send(todos);
});

router.get('/:id', [auth, oIdValidator], async (req, res) => {
    const todo = await Todo
        .findById(req.params.id)
        .populate(populateConfig);
    if (!todo) return res.status(404).send('The todo with the given ID was not found.');

    return res.send(todo);
});

router.post('/', [auth], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let todo = new Todo(req.body);
    todo = await todo.save();

    // push new todo into project
    const todoID = todo._id;
    const projectID = req.body.project;
    const project = await Project.findByIdAndUpdate(projectID, { $push: { todos: todoID } });
    if (!project) {
        todo = await Todo.findByIdAndDelete(todoID);
        return res.status(404).send('The project with the given ID was not found.');
    }

    return res.send(todo);
});

router.put('/:id', [auth, oIdValidator], async (req, res) => {
    const { error } = validateExisting(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!todo) return res.status(404).send('The todo with the given ID was not found.');

    return res.send(todo);
});

router.delete('/:id', [auth, oIdValidator], async (req, res) => {
    const todo = await Todo.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!todo) return res.status(404).send('The todo with the given ID was not found.');

    return res.send(todo);
});

module.exports = router;
