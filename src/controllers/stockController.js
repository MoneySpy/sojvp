const { getSheet, appendSheet, updateSheetRow, clearSheetRow } = require('../utils/googleSheets');

const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // TODO: ใส่ Spreadsheet ID จริง
const SHEET_NAME = 'stocks'; // หรือชื่อ sheet ที่ใช้จริง

// เพิ่มอะไหล่
async function addStock(req, res) {
  const { name, quantity, unit, minStock } = req.body;
  const stock = [
    Date.now(), // id (timestamp)
    name,
    Number(quantity),
    unit,
    Number(minStock) || 0,
    new Date().toISOString(),
    new Date().toISOString()
  ];
  await appendSheet(SHEET_ID, SHEET_NAME, stock);
  res.json({ message: 'เพิ่มอะไหล่สำเร็จ' });
}

// แก้ไขอะไหล่
async function updateStock(req, res) {
  const { id, name, quantity, unit, minStock } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == id);
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบอะไหล่' });
  if (name) rows[idx][1] = name;
  if (quantity !== undefined) rows[idx][2] = Number(quantity);
  if (unit) rows[idx][3] = unit;
  if (minStock !== undefined) rows[idx][4] = Number(minStock);
  rows[idx][6] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:G${idx+1}`, rows[idx]);
  res.json({ message: 'แก้ไขอะไหล่สำเร็จ' });
}

// ลบอะไหล่
async function deleteStock(req, res) {
  const { id } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == id);
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบอะไหล่' });
  await clearSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:G${idx+1}`);
  res.json({ message: 'ลบอะไหล่สำเร็จ' });
}

// ดึงรายการอะไหล่
async function getStocks(req, res) {
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  res.json(data);
}

// ตัดสต็อก
async function deductStock(req, res) {
  const { id, amount } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == id);
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบอะไหล่' });
  if (Number(rows[idx][2]) < amount) return res.status(400).json({ message: 'จำนวนคงเหลือไม่พอ' });
  rows[idx][2] = Number(rows[idx][2]) - Number(amount);
  rows[idx][6] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:G${idx+1}`, rows[idx]);
  res.json({ message: 'ตัดสต็อกสำเร็จ' });
}

// ประวัติการตัดสต็อก (mock)
async function getStockHistory(req, res) {
  res.json([]); // ในระบบจริงควรเก็บ log แยก
}

module.exports = { addStock, updateStock, deleteStock, getStocks, deductStock, getStockHistory }; 