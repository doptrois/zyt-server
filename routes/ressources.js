const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Ressource, validate} = require('../models/ressource');
const oIdValidator = require('../middleware/oIdValidator');
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
        path: 'project',
        select: 'briefing start deadline total_time_offered'
    },
    {
        path: 'owner',
        select: 'first_name surname archived avatar',
        populate: {
            path: 'avatar',
            select: 'url'
        }
    }
];

router.get('/', [auth], async (req, res) => {
    const ressources = await Ressource
        .find()
        .populate(populateConfig)
        .sort('start');

    if (!ressources) return res.status(404).send('No ressources found.');

    res.send(ressources);
});

router.get('/:id', [auth, oIdValidator], async (req, res) => {
    const ressource = await Ressource
        .findById(req.params.id)
        .populate(populateConfig);
    if (!ressource) return res.status(404).send('The ressource with the given ID was not found.');
    res.send(ressource);
});

router.post('/', [auth, admin], async (req, res) => {
    req.body.owner = req.user._id;
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let ressource = new Ressource(req.body);
    ressource = await ressource.save();
    res.send(ressource);
});

router.put('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const ressource = await Ressource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ressource) return res.status(404).send('The ressource with the given ID was not found.');
    res.send(ressource);
});

router.delete('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const ressource = await Todo.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!ressource) return res.status(404).send('The ressource with the given ID was not found.');
    res.send(ressource);
});

module.exports = router;
