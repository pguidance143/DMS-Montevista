/**
 * Parse extracted text from a Sangguniang Bayan document (Resolution, Ordinance, etc.)
 * and return structured metadata.
 */

const parseDocument = (rawText) => {
  const text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const result = {};

  // ── Document type detection ───────────────────────────────
  if (/resolution\s*no/i.test(text)) {
    result.document_type = "Resolution";
  } else if (/ordinance\s*no/i.test(text)) {
    result.document_type = "Ordinance";
  } else if (/executive\s*order\s*no/i.test(text)) {
    result.document_type = "Executive Order";
  } else if (/memorandum\s*no/i.test(text)) {
    result.document_type = "Memorandum";
  } else if (/proclamation\s*no/i.test(text)) {
    result.document_type = "Proclamation";
  }

  // ── Document number ───────────────────────────────────────
  const numMatch = text.match(/(?:resolution|ordinance|executive\s*order|memorandum|proclamation)\s*no\.?\s*(\d+)/i);
  if (numMatch) result.document_number = numMatch[1];

  // ── Series year ───────────────────────────────────────────
  const seriesMatch = text.match(/series\s*(?:of\s*)?(\d{4})/i);
  if (seriesMatch) result.series_year = parseInt(seriesMatch[1]);

  // ── Title / Subject ───────────────────────────────────────
  // Look for quoted title after resolution header, or text between quotes
  const titleMatch = text.match(/["""\u201C]\s*([^"""\u201D]+?)\s*["""\u201D]/);
  if (titleMatch) {
    result.title = titleMatch[1].replace(/\s+/g, " ").trim();
  }

  // ── Session date ──────────────────────────────────────────
  // Look for patterns like "JULY 01, 2025" or "July 1, 2025" near SESSION HALL
  const dateMatch = text.match(/(?:SESSION\s*HALL\s*ON|held\s*(?:at|on))\s+([A-Z]+\s+\d{1,2},?\s+\d{4})/i);
  if (dateMatch) {
    const parsed = new Date(dateMatch[1].replace(",", ""));
    if (!isNaN(parsed.getTime())) {
      result.session_date = parsed.toISOString().slice(0, 10);
    }
  }

  // ── Session type and number ───────────────────────────────
  const sessionMatch = text.match(/(\d+)\s*(?:ST|ND|RD|TH)\s+(REGULAR|SPECIAL)\s+SESSION/i);
  if (sessionMatch) {
    result.session_number = sessionMatch[1] + ordinalSuffix(parseInt(sessionMatch[1]));
    result.session_type = capitalize(sessionMatch[2]);
  }

  // ── Presiding officer ─────────────────────────────────────
  // Look for "Vice Mayor/Presiding" or certified by line
  const presidingMatch = text.match(/(?:HON\.?\s+)?([A-Z][A-Z.\s]+?)\s*[-–—]\s*Vice\s*Mayor\s*\/?\s*Presiding/i)
    || text.match(/(?:EVERGISTO|presiding)[:\s]*(?:HON\.?\s+)?([A-Z][A-Z.\s]+)/i);
  if (presidingMatch) {
    result.presiding_officer = formatName(presidingMatch[1]);
  }

  // ── Approved by (Municipal Mayor) ─────────────────────────
  const approvedMatch = text.match(/APPROVED:?\s*(?:HON\.?\s+)?([A-Z][A-Z.,\s]+?)(?:\s*[-–—]\s*|\n\s*)Municipal\s*Mayor/i)
    || text.match(/Municipal\s*Mayor[:\s]*([A-Z][A-Z.,\s]+)/i);
  if (approvedMatch) {
    result.approved_by = formatName(approvedMatch[1]);
  }

  // ── Attested by (Secretary) ───────────────────────────────
  const attestedMatch = text.match(/ATTESTED:?\s*(?:HON\.?\s+)?([A-Z][A-Z.,\s]+?)(?:\s*[-–—]\s*|\n\s*)Secretary/i)
    || text.match(/Secretary\s*to\s*the\s*Sanggunian[:\s]*([A-Z][A-Z.,\s]+)/i);
  if (attestedMatch) {
    result.attested_by = formatName(attestedMatch[1]);
  }

  // ── Author / motion by ───────────────────────────────────
  const motionMatch = text.match(/(?:on\s*motion\s*of|motion\s*by|authored?\s*by)\s+(?:HON\.?\s+)?([A-Z][A-Z.\s]+?)(?:\s+and|\s*[,;])/i);
  if (motionMatch) {
    result.author = formatName(motionMatch[1]);
  }

  // ── Members present ───────────────────────────────────────
  const members = parseMembers(text);
  if (members.length) result.members_present = members;

  // ── Committees ────────────────────────────────────────────
  const committees = parseCommittees(text);
  if (committees.length) result.committees = committees;

  // ── Full content text ─────────────────────────────────────
  result.content_text = text.replace(/\s+/g, " ").trim();

  return result;
};

/**
 * Parse present/absent members from the text.
 */
const parseMembers = (text) => {
  const members = [];
  // Match lines like: "HON. ERIC JOSEPH D. TAPING    - SB Member"
  const memberPattern = /HON\.?\s+([A-Z][A-Z.,\s]+?)\s*[-–—]\s*((?:Vice\s*Mayor|SB\s*Member|SB\s*Member\/\w+)[^\n]*)/gi;
  let match;
  while ((match = memberPattern.exec(text)) !== null) {
    members.push({
      member_name: formatName(match[1]),
      position: match[2].trim(),
      is_present: true,
    });
  }

  // Check absent section
  const absentMatch = text.match(/Absent:?\s*([^\n]+)/i);
  if (absentMatch && !/none/i.test(absentMatch[1])) {
    const absentNames = absentMatch[1].split(/[,;]/).map((n) => n.trim()).filter(Boolean);
    absentNames.forEach((name) => {
      members.push({
        member_name: formatName(name.replace(/^HON\.?\s*/i, "")),
        position: "SB Member",
        is_present: false,
      });
    });
  }

  return members;
};

/**
 * Parse committees from the text.
 */
const parseCommittees = (text) => {
  const committees = [];
  // Match committee headers like: "1. COMMITTEE ON YOUTH, SPORTS, GAMES AND AMUSEMENTS:"
  const committeePattern = /\d+\.?\s+COMMITTEE\s+ON\s+([A-Z][A-Z,\s/&]+?)(?::|;|\n)/gi;
  let match;
  const committeePositions = [];

  while ((match = committeePattern.exec(text)) !== null) {
    committeePositions.push({
      name: "Committee on " + capitalize(match[1].trim()),
      index: match.index,
    });
  }

  // Also check for "Special Committee:" section
  const specialMatch = text.match(/Special\s+Committee/i);

  for (let i = 0; i < committeePositions.length; i++) {
    const start = committeePositions[i].index;
    const end = i + 1 < committeePositions.length
      ? committeePositions[i + 1].index
      : (specialMatch ? text.indexOf("Special Committee", start + 1) : text.length);

    const block = text.slice(start, end === -1 ? undefined : end);
    const members = [];

    // Parse Chairperson
    const chairMatch = block.match(/Chairperson\s*[-–—:]\s*(?:HON\.?\s+)?([A-Z][A-Z.,\s]+?)(?:\n|$)/i);
    if (chairMatch) {
      members.push({ member_name: formatName(chairMatch[1]), role: "Chairperson" });
    }

    // Parse Vice Chairperson
    const viceMatch = block.match(/Vice\s*Chairperson\s*[-–—:]\s*(?:HON\.?\s+)?([A-Z][A-Z.,\s]+?)(?:\n|$)/i);
    if (viceMatch) {
      members.push({ member_name: formatName(viceMatch[1]), role: "Vice Chairperson" });
    }

    // Parse Members - lines after "Member" that start with "- Hon."
    const memberLines = block.match(/[-–—]\s*(?:HON\.?\s+)?([A-Z][A-Z.,\s]+?)(?:\n|$)/gi);
    if (memberLines) {
      memberLines.forEach((line) => {
        const m = line.match(/[-–—]\s*(?:HON\.?\s+)?([A-Z][A-Z.,\s]+)/i);
        if (m) {
          const name = formatName(m[1]);
          // Skip if already added as chair/vice
          if (!members.some((mem) => mem.member_name === name)) {
            members.push({ member_name: name, role: "Member" });
          }
        }
      });
    }

    committees.push({
      committee_name: committeePositions[i].name,
      members,
    });
  }

  return committees;
};

// ── Helpers ─────────────────────────────────────────────────

const formatName = (name) => {
  return name
    .replace(/,\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => {
      if (w.length <= 3 && w === w.toUpperCase()) return w; // Keep JR., III, IV, etc.
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
};

const capitalize = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const ordinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

module.exports = { parseDocument };
