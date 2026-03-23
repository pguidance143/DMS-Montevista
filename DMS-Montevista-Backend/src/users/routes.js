const express = require("express");
const router = express.Router();
const { listUsers, addUser, editUser, removeUser } = require("./controller");

router.get("/", listUsers);
router.post("/", addUser);
router.put("/:id", editUser);
router.delete("/:id", removeUser);

module.exports = router;
