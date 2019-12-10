let jwt = require("jsonwebtoken");
const config = require("./config.js");

let checkToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  token = token.slice(7, token.length);
};

if (token) {
  jwt.verify(token, "KEy", (err, decoded) => {
    if (err) {
      return res.json({
        success: false,
        message: "Token is not valid"
      });
    } else {
      req.decoded = decoded;
      next();
    }
  });
} else {
  return res.json({
    success: false,
    message: "Auth token is not supplied"
  });
}
module.exports = {
  checkToken: checkToken
};
