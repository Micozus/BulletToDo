const express = require('express');
const bodyParser = require('body-parser');

const mongoConnect = require('./util/database').mongoConnect;

const entryRoutes = require('./routes/entry');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    //Do zmiany, ustawienie adresu strony
    const APP_URL = '*';
    res.setHeader('Access-Control-Allow-Origin', APP_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/api', entryRoutes);

mongoConnect(() => {
    app.listen(3000);
});

