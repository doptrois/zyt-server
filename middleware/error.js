const debug = require('debug')('app:runtime');

module.exports = function error(err, req, res) {
    debug(err);
    return res.status(500).send('Something failed.');
};
