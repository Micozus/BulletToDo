const express = require('express');

const mongoConnect = require('./util/database').mongoConnect;

const app = express();

const entryRoutes = require('./routes/entry');

app.use('/api', entryRoutes);

mongoConnect(() => {
    app.listen(3000);
});

