const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Position, validate} = require('../models/position');
const oIdValidator = require('../middleware/oIdValidator');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const populateConfig = [
    {
        path: 'todos',
        select: '-owner',
        populate: [
            {
                path: 'expenses',
                select: 'recorded_time'
            },
            {
                path: 'assigned_users',
                select: 'first_name surname archived avatar',
                populate: {
                    path: 'avatar'
                }
            }
        ]
    }
];

router.get('/', [auth], async (req, res) => {
    const positions = await Position
        .find()
        .populate(populateConfig)
        .sort('name');
    res.send(positions);
});

router.get('/:id', [auth, oIdValidator], async (req, res) => {
    const position = await Position
        .findById(req.params.id)
        .populate(populateConfig);
    if (!position) return res.status(404).send('The position with the given ID was not found.');
    res.send(position);
});

router.post('/', [auth], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let position = new Position(req.body);
    position = await position.save();
    res.send(position);
});

router.put('/:id', [auth, oIdValidator], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const position = await Position.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!position) return res.status(404).send('The position with the given ID was not found.');
    res.send(position);
});

router.delete('/:id', [auth, oIdValidator], async (req, res) => {
    const position = await Position.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!position) return res.status(404).send('The position with the given ID was not found.');
    res.send(position);
});

module.exports = router;
