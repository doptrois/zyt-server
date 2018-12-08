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
    },
    {
        path: 'ressources',
        select: 'assigned_users archived start stop',
        populate: {
            path: 'assigned_users',
            select: 'first_name surname archived avatar',
            populate: {
                path: 'avatar',
                select: 'url'
            }
        }
    }
];

router.get('/', [auth], async (req, res) => {
    let projects = await Project
        .find()
        .select()
        .populate(populateConfig);

    if (!projects) return res.status(404).send('No projects found.');

    // return only projects that are assigned to the user,
    // if user is not admin
    if (!req.user.admin) {
        projects = projects.filter((project) => {
            if (
                project.assigned_users.find(user => user._id == req.user._id) ||
                project.project_managers.find(user => user._id == req.user._id)
            ) {
            	return true;
            }
        });

        if(!projects.length) return res.status(404).send('No projects found. You are not assigned to any projects.');
    }

    res.send(projects);
});

router.get('/:id', [auth, oIdValidator], async (req, res) => {
    let project = await Project
        .findById(req.params.id)
        .populate(populateConfig);

    if (!project) return res.status(404).send('The project with the given ID was not found.');

    // return only project if assigned to the user,
    // if user is not admin
    if (!req.user.admin) {
        if (
            !project.assigned_users.find(user => user._id == req.user._id) ||
            !project.project_managers.find(user => user._id == req.user._id)
        ) {
            return res.status(403).send('You are not assigned to this project.');
        }
    }

    res.send(project);
});

router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let project = new Project(req.body);
    project = await project.save();
    res.send(project);
});

router.put('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).send('The project with the given ID was not found.');
    res.send(project);
});

router.delete('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const project = await Project.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!project) return res.status(404).send('The project with the given ID was not found.');
    res.send(project);
});

module.exports = router;
