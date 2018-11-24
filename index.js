const cors = require('cors');
const debug = require('debug')('app:runtime');
require('express-async-errors');
const error = require('./middleware/error');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const mongoose = require('mongoose');
const projects = require('./routes/projects');
const positions = require('./routes/positions');
const todos = require('./routes/todos');
const expenses = require('./routes/expenses');
const avatars = require('./routes/avatars');
const users = require('./routes/users');
const auth = require('./routes/auth');
const express = require('express');
const app = express();

process.on('uncaughtException', (ex) => {
    debug(ex);
});

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

app.use(helmet());

// To change environment
// $ export NODE_ENV=production
// $ export NODE_ENV=development
// if nothing is set previously, the environment is 'development' by default.
if (app.get('env') === 'development') {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}
// To get the configuration for the current environment:
// config.get('name')
// config.get('example.key-one')
// config.get('example.key-one')
// the file names 'development' and 'production' corresponds to the defined environment
// that was set by 'export NODE_ENV=XYZ' in the terminal.

// Custom environment variables
// $ export zyt_mailServerHost=1234
// declare/map in: config/custom-environment-variables.json
// usage: config.get('mail.host')

app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use('/api/projects', projects);
app.use('/api/positions', positions);
app.use('/api/todos', todos);
app.use('/api/expenses', expenses);
app.use('/api/avatars', avatars);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use(error);

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
