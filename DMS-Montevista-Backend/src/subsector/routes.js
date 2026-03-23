const express = require("express");
const router = express.Router();
const { listSubsectors, addSubsector, editSubsector, removeSubsector } = require("./controller");

router.get("/", listSubsectors);
router.post("/", addSubsector);
router.put("/:id", editSubsector);
router.delete("/:id", removeSubsector);

module.exports = router;
