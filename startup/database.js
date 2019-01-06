const mongoose = require('mongoose');
const config = require('config');
const debug = require('debug')('app:runtime');

module.exports = function database() {
    const db = config.get('db');
    mongoose.connect(config.get('db'),
        {
            useCreateIndex: true,
            useNewUrlParser: true,
        })
        .then(() => debug(`Connected to MongoDB ${db}...`))
        .catch(() => debug('Could not connect to MongoDB...'));
};
