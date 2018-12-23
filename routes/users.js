const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { User, validate, validateExisting } = require('../models/user');
const oIdValidator = require('../middleware/oIdValidator');
const router = express.Router();

const populateConfig = [
    {
        path: 'avatar',
        select: 'url',
    },
];

const dbSelectProperties = 'admin first_name surname email archived avatar';

router.get('/', [auth], async (req, res) => {
    let users = await User
        .find()
        .select(dbSelectProperties)
        .populate(populateConfig);

    // return only projects that are assigned to the user,
    // if user is not admin
    if (!req.user.admin) {
        users = users.filter((user) => {
            if (user._id == req.user._id) {
                return true;
            }
            return false;
        });
        if (!users.length) return res.status(404).send('You were not found.');
    }

    return res.send(users);
});

router.get('/me', [auth], async (req, res) => {
    const users = await User
        .findById(req.user._id)
        .select(dbSelectProperties)
        .populate(populateConfig);
    return res.send(users);
});

router.get('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const user = await User
        .findById(req.params.id)
        .select(dbSelectProperties)
        .populate(populateConfig);
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    return res.send(user);
});

router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User alread registered');
    user = new User(_.pick(req.body, ['first_name', 'surname', 'email', 'avatar', 'password']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user = await user.save();
    const token = user.generateAuthToken();

    return res.header('x-auth-token', token).send(_.pick(req.body, ['_id', 'first_name', 'surname', 'email', 'avatar']));
});

router.put('/:id', [auth, oIdValidator], async (req, res) => {
    const { error } = validateExisting(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User
        .findById(req.params.id)
        .populate(populateConfig);
    if (!user) return res.status(404).send('The user with the given ID was not found.');

    if (!req.user.admin) {
        if (user._id != req.user._id) return res.status(403).send('Access denied. Modifiying user properties are restricted to the user itself or admins.');
    }

    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(populateConfig);

        const token = user.generateAuthToken();
        res.header('x-auth-token', token).send(_.pick(user, ['_id', 'first_name', 'surname', 'email', 'avatar']));
    } else {
        user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(populateConfig);
        res.send(_.pick(user, ['_id', 'first_name', 'surname', 'email', 'avatar']));
    }
});

router.delete('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { archived: true });
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    return res.send(user);
});

module.exports = router;
