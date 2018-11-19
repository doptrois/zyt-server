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

const dbSelectProperties = 'isAdmin first_name surname email archived avatar';

router.get('/', [auth], async (req, res) => {
    const users = await User
        .find()
        .select(dbSelectProperties)
        .populate(populateConfig);
    res.send(users);
});

router.get('/me', [auth], async (req, res) => {
    const users = await User
        .findById(req.user._id)
        .select(dbSelectProperties)
        .populate(populateConfig);
    res.send(users);
});

router.get('/:id', [auth, oIdValidator], async (req, res) => {
    const user = await User
        .findById(req.params.id)
        .select(dbSelectProperties)
        .populate(populateConfig);
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
});

router.post('/', [auth], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User alread registered');
    user = new User(_.pick(req.body, ['first_name', 'surname', 'email', 'avatar', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(req.body, ['_id', 'first_name', 'surname', 'email', 'avatar']));
});

router.put('/:id', [auth, oIdValidator], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
});

router.delete('/:id', [auth, oIdValidator], async (req, res) => {
    let user = await User.findByIdAndUpdate(req.params.id, { archived: true });
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
});

module.exports = router;
