const express = require("express");
const router = express.Router();
const { listRoles, listPages, addRole, editRole, removeRole } = require("./controller");

router.get("/", listRoles);
router.get("/pages", listPages);
router.post("/", addRole);
router.put("/:id", editRole);
router.delete("/:id", removeRole);

module.exports = router;
