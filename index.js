const express = require('express');
const app = express();
const debug = require('debug')('app:runtime');

require('./startup/logger')(app);
require('./startup/routes')(app);
require('./startup/database')();
require('./startup/config')();

const port = process.env.PORT || 9000;
const server = app.listen(port, () => debug(`Listening on port ${port}...`));

module.exports = server;
