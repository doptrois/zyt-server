const morgan = require('morgan');
const debug = require('debug')('app:runtime');
require('express-async-errors');

module.exports = function logger(app) {
    process.on('uncaughtException', (ex) => {
        debug(ex);
    });

    if (app.get('env') === 'development') {
        app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
    }
};
