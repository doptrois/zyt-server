const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const projects = require('./routes/projects');
const positions = require('./routes/positions');
const todos = require('./routes/todos');
const expenses = require('./routes/expenses');
const avatars = require('./routes/avatars');
const users = require('./routes/users');
// const auth = require('./routes/auth');
const express = require('express');
const app = express();

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

mongoose.connect('mongodb://localhost/zyt',
    {
        // https://github.com/Automattic/mongoose/issues/6890
        useCreateIndex: true,
        // https://stackoverflow.com/questions/50448272/avoid-current-url-string-parser-is-deprecated-warning-by-setting-usenewurlpars
        useNewUrlParser: true
    })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use('/api/projects', projects);
app.use('/api/positions', positions);
app.use('/api/todos', todos);
app.use('/api/expenses', expenses);
app.use('/api/avatars', avatars);
app.use('/api/users', users);
// app.use('/api/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
