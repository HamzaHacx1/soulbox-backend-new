// Mirror one database row into a Google Sheet tab (one row per id, header in row 1).
// Uses the existing Google service account. Does nothing until the Sheet id is set.
let client;
function sheets() {
  if (client) return client;
  const { google } = require("googleapis");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  client = google.sheets({ version: "v4", auth });
  return client;
}

// The SoulBox Sheet for quiz readers ("Readers" tab). Gifts have their own Sheet (GIFTS_SHEET_ID),
// so readers are never written into the client's gift Sheet.
function sheetId() { return process.env.READERS_SHEET_ID || process.env.SOULBOX_SHEET_ID || null; }

function cell(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// `header` may add trailing columns that are filled in by hand; only `columns` are ever written.
async function upsertRow({ tab, columns, row, header = columns }) {
  const spreadsheetId = sheetId();
  if (!spreadsheetId) return { skipped: true };
  const api = sheets();
  const ids = (await api.spreadsheets.values.get({ spreadsheetId, range: `${tab}!A:A` })).data.values || [];
  if (!ids.length) {
    await api.spreadsheets.values.update({ spreadsheetId, range: `${tab}!A1`, valueInputOption: "RAW", requestBody: { values: [header] } });
    ids.push([columns[0]]);
  }
  const values = [columns.map((c) => cell(row[c]))];
  const index = ids.findIndex((r) => r[0] === String(row[columns[0]]));
  if (index > 0) {
    await api.spreadsheets.values.update({ spreadsheetId, range: `${tab}!A${index + 1}`, valueInputOption: "RAW", requestBody: { values } });
  } else {
    await api.spreadsheets.values.append({ spreadsheetId, range: `${tab}!A1`, valueInputOption: "RAW", insertDataOption: "INSERT_ROWS", requestBody: { values } });
  }
  return { synced: true };
}

module.exports = { upsertRow, sheetId, cell };
