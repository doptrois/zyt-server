const mongoose = require('mongoose');

module.exports = function oIdValidator(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('The given ID was not a valid ObjectID.');
    return next();
};
