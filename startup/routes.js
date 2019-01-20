const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const error = require('../middleware/error');
const projects = require('../routes/projects');
const positions = require('../routes/positions');
const todos = require('../routes/todos');
const expenses = require('../routes/expenses');
const avatars = require('../routes/avatars');
const users = require('../routes/users');
const ressources = require('../routes/ressources');
const auth = require('../routes/auth');

module.exports = function routes(app) {
    app.use(helmet());
    app.use(cors());
    app.options('*', cors());
    app.use(express.json());
    app.use('/api/projects', projects);
    app.use('/api/positions', positions);
    app.use('/api/todos', todos);
    app.use('/api/expenses', expenses);
    app.use('/api/avatars', avatars);
    app.use('/api/users', users);
    app.use('/api/ressources', ressources);
    app.use('/api/auth', auth);
    app.use(error);
};
