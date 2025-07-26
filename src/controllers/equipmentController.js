const { getSheet, appendSheet, updateSheetRow, clearSheetRow } = require('../utils/googleSheets');

const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // TODO: ใส่ Spreadsheet ID จริง
const SHEET_NAME = 'equipments'; // หรือชื่อ sheet ที่ใช้จริง

// เพิ่มครุภัณฑ์
async function addEquipment(req, res) {
  const { name, status, location } = req.body;
  const equipment = [
    Date.now(), // id (timestamp)
    name,
    status || 'พร้อมใช้งาน',
    location || '',
    new Date().toISOString(),
    new Date().toISOString()
  ];
  await appendSheet(SHEET_ID, SHEET_NAME, equipment);
  res.json({ message: 'เพิ่มครุภัณฑ์สำเร็จ' });
}

// แก้ไขครุภัณฑ์
async function updateEquipment(req, res) {
  const { id, name, status, location } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == id);
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบครุภัณฑ์' });
  if (name) rows[idx][1] = name;
  if (status) rows[idx][2] = status;
  if (location) rows[idx][3] = location;
  rows[idx][5] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:F${idx+1}`, rows[idx]);
  res.json({ message: 'แก้ไขครุภัณฑ์สำเร็จ' });
}

// ลบครุภัณฑ์
async function deleteEquipment(req, res) {
  const { id } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == id);
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบครุภัณฑ์' });
  await clearSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:F${idx+1}`);
  res.json({ message: 'ลบครุภัณฑ์สำเร็จ' });
}

// ดึงรายการครุภัณฑ์
async function getEquipments(req, res) {
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  res.json(data);
}

// ปรับสถานะการใช้งาน
async function updateEquipmentStatus(req, res) {
  const { id, status } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == id);
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบครุภัณฑ์' });
  rows[idx][2] = status;
  rows[idx][5] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:F${idx+1}`, rows[idx]);
  res.json({ message: 'ปรับสถานะสำเร็จ' });
}

module.exports = { addEquipment, updateEquipment, deleteEquipment, getEquipments, updateEquipmentStatus }; 