const express = require("express");
const router = express.Router();
const { login } = require("./controller");

router.post("/login", login);

module.exports = router;
