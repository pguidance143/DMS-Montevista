const express = require("express");
const router = express.Router();
const { listUsers, addUser, editUser, removeUser, changePassword } = require("./controller");

router.get("/", listUsers);
router.post("/", addUser);
router.put("/:id", editUser);
router.delete("/:id", removeUser);
router.patch("/:id/password", changePassword);

module.exports = router;
