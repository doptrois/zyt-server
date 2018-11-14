const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Project, validate} = require('../models/project');
const oIdValidator = require('../middleware/oIdValidator');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const populateConfig = [
    {
        path: 'project_managers',
        select: 'first_name surname archived avatar',
        populate: {
            path: 'avatar',
            select: 'url'
        }
    },
    {
        path: 'positions',
        populate: {
            path: 'todos',
            select: 'expenses name total_time_expected archived deadline status',
            populate: {
                path: 'expenses',
                select: ['recorded_time']
            }
        }
    },
    {
        path: 'assigned_users',
        select: 'first_name surname archived avatar',
        populate: {
            path: 'avatar',
            select: 'url'
        }
    }
];

router.get('/', async (req, res) => {
    const projects = await Project
        .find()
        .select()
        .populate(populateConfig)
        .sort('surname');
    res.send(projects);
});

router.get('/:id', oIdValidator, async (req, res) => {
    const project = await Project
        .findById(req.params.id)
        .populate(populateConfig);
    if (!project) return res.status(404).send('The project with the given ID was not found.');
    res.send(project);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let project = new Project(req.body);
    project = await project.save();
    res.send(project);
});

router.put('/:id', oIdValidator, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).send('The project with the given ID was not found.');
    res.send(project);
});

router.delete('/:id', oIdValidator, async (req, res) => {
    const project = await Project.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!project) return res.status(404).send('The project with the given ID was not found.');
    res.send(project);
});

module.exports = router;
