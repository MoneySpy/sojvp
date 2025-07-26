const { getSheet } = require('../utils/googleSheets');

const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // TODO: ใส่ Spreadsheet ID จริง
const REPAIRS_SHEET = 'repairs'; // หรือชื่อ sheet ที่ใช้จริง

// กราฟจำนวนแจ้งซ่อมแต่ละเดือน
async function getMonthlyRepairStats(req, res) {
  const rows = await getSheet(SHEET_ID, REPAIRS_SHEET);
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  const stats = {};
  data.forEach(r => {
    const month = new Date(r.createdAt).getFullYear() + '-' + (new Date(r.createdAt).getMonth() + 1);
    stats[month] = (stats[month] || 0) + 1;
  });
  res.json(stats);
}

// กราฟค่าใช้จ่ายแต่ละเดือน
async function getMonthlyExpenseStats(req, res) {
  const rows = await getSheet(SHEET_ID, REPAIRS_SHEET);
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  const stats = {};
  data.forEach(r => {
    const month = new Date(r.createdAt).getFullYear() + '-' + (new Date(r.createdAt).getMonth() + 1);
    stats[month] = (stats[month] || 0) + (Number(r.cost) || 0);
  });
  res.json(stats);
}

module.exports = { getMonthlyRepairStats, getMonthlyExpenseStats }; 