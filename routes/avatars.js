const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Avatar, validate} = require('../models/avatar');
const oIdValidator = require('../middleware/oIdValidator');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const avatars = await Avatar
        .find()
        .sort('name');
    res.send(avatars);
});

router.get('/:id', oIdValidator, async (req, res) => {
    const avatar = await Avatar.findById(req.params.id);
    if (!avatar) return res.status(404).send('The avatar with the given ID was not found.');
    res.send(avatar);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let avatar = new Avatar(req.body);
    avatar = await avatar.save();
    res.send(avatar);
});

router.put('/:id', oIdValidator, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const avatar = await Avatar.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!avatar) return res.status(404).send('The avatar with the given ID was not found.');
    res.send(avatar);
});

router.delete('/:id', oIdValidator, async (req, res) => {
    const avatar = await Avatar.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!avatar) return res.status(404).send('The avatar with the given ID was not found.');
    res.send(avatar);
});

module.exports = router;
