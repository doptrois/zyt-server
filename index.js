const cors = require('cors');
const debug = require('debug')('app:runtime');
require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const mongoose = require('mongoose');
const error = require('./middleware/error');
const projects = require('./routes/projects');
const positions = require('./routes/positions');
const todos = require('./routes/todos');
const expenses = require('./routes/expenses');
const avatars = require('./routes/avatars');
const users = require('./routes/users');
const ressources = require('./routes/ressources');
const auth = require('./routes/auth');
const app = express();

process.on('uncaughtException', (ex) => {
    debug(ex);
});

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

mongoose.connect(config.get('db'),
    {
        // https://github.com/Automattic/mongoose/issues/6890
        useCreateIndex: true,
        // https://stackoverflow.com/questions/50448272/avoid-current-url-string-parser-is-deprecated-warning-by-setting-usenewurlpars
        useNewUrlParser: true
    })
    .then(() => console.log(`Connected to MongoDB ${config.get('db')}...`))
    .catch(err => console.error('Could not connect to MongoDB...'));

app.use(helmet());

if (app.get('env') === 'development') {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

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

const port = process.env.PORT || 9000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;
