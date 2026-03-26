const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

/**
 * Extract text from a file (PDF or image).
 * Returns the raw text string.
 */
const extractText = async (filePath, mimeType) => {
  if (mimeType === "application/pdf") {
    return extractFromPdf(filePath);
  }
  if (mimeType.startsWith("image/")) {
    return extractFromImage(filePath);
  }
  return "";
};

const extractFromPdf = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || "";
};

const extractFromImage = async (filePath) => {
  const { data } = await Tesseract.recognize(filePath, "eng", {
    logger: () => {},
  });
  return data.text || "";
};

module.exports = { extractText };
