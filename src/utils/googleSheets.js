const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// โหลด credentials จากไฟล์ (ควรตั้งชื่อไฟล์ credentials.json และวางไว้ในโฟลเดอร์นี้)
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const credentials = fs.existsSync(CREDENTIALS_PATH) ? require(CREDENTIALS_PATH) : null;

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuth() {
  if (!credentials) throw new Error('กรุณาวางไฟล์ credentials.json ใน src/utils/');
  return new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
}

async function getSheet(sheetId, range) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  return res.data.values;
}

async function appendSheet(sheetId, range, values) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] }
  });
}

async function updateSheetRow(sheetId, range, values) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] }
  });
}

async function clearSheetRow(sheetId, range) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.clear({ spreadsheetId: sheetId, range });
}

module.exports = {
  getSheet,
  appendSheet,
  updateSheetRow,
  clearSheetRow
};
