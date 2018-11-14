const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User, validate} = require('../models/user');
const oIdValidator = require('../middleware/oIdValidator');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const populateConfig = [
    {
        path: 'avatar',
        select: 'url'
    }
];
router.get('/', async (req, res) => {
    const users = await User
        .find()
        .select('first_name surname archived avatar')
        .populate(populateConfig);
    res.send(users);
});

router.get('/:id', oIdValidator, async (req, res) => {
    const user = await User
        .findById(req.params.id)
        .select('first_name surname archived avatar')
        .populate(populateConfig);
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = new User(req.body);
    user = await user.save();
    res.send(user);
});

router.put('/:id', oIdValidator, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
});

router.delete('/:id', oIdValidator, async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
});

module.exports = router;
