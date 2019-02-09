const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Ressource, validate, validateExisting } = require('../models/ressource');
const { Project } = require('../models/project');
const oIdValidator = require('../middleware/oIdValidator');
const router = express.Router();

const populateConfig = [
    {
        path: 'assigned_user',
        select: 'first_name surname archived',
    },
    {
        path: 'project',
        select: 'briefing start deadline total_time_offered name assigned_users',
        populate: {
            path: 'assigned_users',
            select: 'first_name surname archived',
        },
    },
    {
        path: 'owner',
        select: 'first_name surname archived',
    },
];

router.get('/', [auth], async (req, res) => {
    let ressources = await Ressource
        .find()
        .populate(populateConfig)
        .sort('start');

    if (!ressources) return res.status(404).send('No ressources found.');

    // return only ressources that are assigned to the user,
    // if user is not admin
    if (!req.user.admin) {
        ressources = ressources.filter((ressource) => {
            if (
                ressource.assigned_user._id == req.user._id
            ) {
                return true;
            }
            return false;
        });
        if (!ressources.length) return res.status(404).send('No ressources found. You are not assigned to any ressources.');
    }
    if (!ressources.length) return res.status(404).send('No ressources found.');

    return res.send(ressources);
});

router.get('/:id', [auth, oIdValidator], async (req, res) => {
    const ressource = await Ressource
        .findById(req.params.id)
        .populate(populateConfig);
    if (!ressource) return res.status(404).send('The ressource with the given ID was not found.');
    return res.send(ressource);
});

router.post('/', [auth, admin], async (req, res) => {
    req.body.owner = req.user._id;
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let ressource = new Ressource(req.body);
    ressource = await ressource.save();

    // push new ressource into project
    const ressourceID = ressource._id;
    const projectID = req.body.project;
    const project = await Project.findByIdAndUpdate(projectID, { $push: { ressources: ressourceID } });
    if (!project) {
        ressource = await Ressource.findByIdAndDelete(ressourceID);
        return res.status(404).send('The project with the given ID was not found.');
    }

    return res.send(ressource);
});

router.put('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const { error } = validateExisting(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const ressource = await Ressource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ressource) return res.status(404).send('The ressource with the given ID was not found.');
    return res.send(ressource);
});

router.delete('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const ressource = await Ressource.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!ressource) return res.status(404).send('The ressource with the given ID was not found.');

    return res.send(ressource);
});

module.exports = router;
