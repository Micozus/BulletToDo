const express = require("express");

const mongoConnect = require("./util/database").mongoConnect;

const entryRoutes = require("./routes/entry");
const userRoutes = require("./routes/user");
const userController = require('./controllers/user');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    //Do zmiany, ustawienie adresu strony
    const APP_URL = "*";
    res.setHeader("Access-Control-Allow-Origin", APP_URL);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});

app.use("/user", userRoutes);

app.use((req, res, next) => userController.verifyToken(req, res, next));

app.use("/api", entryRoutes);

mongoConnect(() => {
    app.listen(3000);
});

module.exports = app;
