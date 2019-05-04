
require('../common');
require('mongodb');

let mongoose = require('mongoose');
let db = mongoose.connection;
// symbol export
global.mongoose = mongoose;
global.db = db;

let ObjectId = mongoose.Types.ObjectId;
log("Connecting database.");
mongoose.connect('mongodb://mouseisbest.kmdns.net:1033/new_svr', {
    useMongoClient: true,
});
/*mongoose.connect('mongodb://10.0.0.36/new_svr', {
    useMongoClient: true,
});*/
mongoose.Promise = Promise;

db.on('error', function callback() {
    log("Database connection error", 2);
});

db.once('open', function callback() {
    log("Mongo working!");
});

global.checkId = function (id) {
    return ObjectId.isValid(id);
};