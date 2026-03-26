const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const {
  listDocuments,
  getDocument,
  addDocument,
  editDocument,
  removeDocument,
  listDocumentTypes,
  listSeriesYears,
} = require("./controller");

const router = Router();

// ── Multer config ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Routes ──────────────────────────────────────────────────
router.get("/",           listDocuments);
router.get("/types",      listDocumentTypes);
router.get("/years",      listSeriesYears);
router.get("/:id",        getDocument);
router.post("/",          upload.single("file"), addDocument);
router.put("/:id",        upload.single("file"), editDocument);
router.delete("/:id",     removeDocument);

module.exports = router;
