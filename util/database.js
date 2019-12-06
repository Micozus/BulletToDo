const mongoose = require('mongoose');

// let _db;

const DB_USERNAME = 'db_user';
const DB_PASS = 'fN9lDRGyprFw3e8C';
const DB_NAME = 'journal';

const DB_URI = `mongodb+srv://${DB_USERNAME}:${DB_PASS}@bulletjournalcluster-paaas.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const DB_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const mongoConnect = callback => {
    mongoose.connect(DB_URI, DB_OPTIONS)
        .then(() => {
            callback();
            console.log("Connected")
        })
        .catch(err => {
            console.log(err);
            throw err;
        })
};

// const getDb = () => {
//     if (_db) {
//         return _db;
//     }
//     throw 'No database found!';
// };

module.exports.mongoConnect = mongoConnect;
// module.exports.getDb = getDb;
