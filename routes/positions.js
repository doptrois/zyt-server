const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Position, validate, validateExisting } = require('../models/position');
const { Project } = require('../models/project');
const oIdValidator = require('../middleware/oIdValidator');
const router = express.Router();

const populateConfig = [
    {
        path: 'expenses',
        populate: [
            {
                path: 'project',
                select: 'name briefing',
            },
            {
                path: 'user',
                select: 'first_name surname archived',
            },
        ],
    },
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
    return res.send(position);
});

router.post('/', [auth], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let position = new Position(req.body);
    position = await position.save();

    // push new position into project
    const positionID = position._id;
    const projectID = req.body.project;
    const project = await Project.findByIdAndUpdate(projectID, { $push: { positions: positionID } });
    if (!project) {
        position = await Position.findOneAndDelete({ _id: positionID });
        return res.status(500).send('The project with the given ID was not found.');
    }

    return res.send(position);
});

router.put('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const { error } = validateExisting(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const position = await Position.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!position) return res.status(404).send('The position with the given ID was not found.');
    return res.send(position);
});

router.delete('/:id', [auth, admin, oIdValidator], async (req, res) => {
    const position = await Position.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!position) return res.status(404).send('The position with the given ID was not found.');
    return res.send(position);
});

module.exports = router;
