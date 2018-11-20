const debug = require('debug')('app:runtime');

// Usage:
// $ export DEBUG=app:runtime && nodemon index.js
// The following js code only appears in the console,
// if the environment variable DEBUG is set to app:startup
// startupDebugger('Custom message')
// combination:
// $ export DEBUG=app:runtime,app:db
// or everything:
// $ export DEBUG=app:*

// tbd: replace with winston
module.exports = function(err, req, res, next) {
    debug(err);
    res.status(500).send('Something failed.');
}
