const express = require("express");
const router = express.Router();
const { listSectors, addSector, editSector, removeSector } = require("./controller");

router.get("/", listSectors);
router.post("/", addSector);
router.put("/:id", editSector);
router.delete("/:id", removeSector);

module.exports = router;
