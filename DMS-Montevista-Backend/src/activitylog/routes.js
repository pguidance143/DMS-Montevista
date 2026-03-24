const express = require("express");
const router = express.Router();
const { listLogs, listActions } = require("./controller");

router.get("/", listLogs);
router.get("/actions", listActions);

module.exports = router;
