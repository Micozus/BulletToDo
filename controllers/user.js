const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const isPreflight = (req) => {
    return (
        req.method === 'OPTIONS' &&
        req.headers['origin'] &&
        req.headers['access-control-request-method']
    )
};


exports.verifyToken = (req, res, next) => {

    if (isPreflight(req)) {
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.status(204).end();
        return
    }

    let token = req.headers["x-access-token"] || req.headers["authorization"];

    if (token) {
        jwt.verify(token, "KEy", (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    "success": false,
                    "message": "Token is not valid"
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).json({
            "success": false,
            "message": "Auth token is not supplied"
        });
    }
};

exports.signupUser = (req, res) => {
    User.find({name: req.body.name})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    "message": "User exists"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            "error": err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: req.body.email,
                            password: hash
                        });
                        user
                            .save()
                            .then(result => {
                                res.status(201).json({
                                    "message": "User created",
                                    "id": user._id
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    "error": err
                                });
                            });
                    }
                });
            }
        });
};

exports.loginUser = (req, res) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    "message": "No user"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(403).json({
                        "message": "Authorisation failed"
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        "KEy",
                        {
                            expiresIn: "1h"
                        }
                    );
                    return res.status(200).json({
                        "message": "Authorisation successful",
                        "token": token
                    });
                }
                res.status(403).json({
                    "message": "Authorisation failed"
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                "error": err
            });
        });
};


