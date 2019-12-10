const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
  User.find({ name: req.body.name })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "User exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
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
                  message: "User created"
                });
              })
              .catch(err => {
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  User.find({ name: req.body.name })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "No user"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Authorisation failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              name: user[0].name,
              userId: user[0]._id
            },
            "KEy",
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Authorisation successful",
            token: token
          });
        }
        res.status(401).json({
          message: "Authorisation failed"
        });
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.get("/", (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  // token = token.slice(7, token.length);

  if (token) {
    jwt.verify(token, "KEy", (err, decoded) => {
      console.log(token);
      if (err) {
        return res.json({
          success: false,
          message: "Token is not valid"
        });
      } else {
        req.decoded = decoded;
        next();
        return res.json({
          success: true,
          message: "Token valid"
        });
      }
    });
  } else {
    return res.json({
      success: false,
      message: "Auth token is not supplied"
    });
  }
});

module.exports = router;