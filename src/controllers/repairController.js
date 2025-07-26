const { notifyLine } = require('../utils/lineNotify');
const { getSheet, appendSheet, updateSheetRow } = require('../utils/googleSheets');

const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // TODO: ใส่ Spreadsheet ID จริง
const SHEET_NAME = 'repairs'; // หรือชื่อ sheet ที่ใช้จริง

// แจ้งซ่อมใหม่
async function createRepair(req, res) {
  const { description, partsUsed, cost } = req.body;
  const repair = [
    Date.now(), // id (timestamp)
    req.user.id,
    description,
    'รอดำเนินการ',
    '', // assignedTo
    new Date().toISOString(),
    new Date().toISOString(),
    JSON.stringify(partsUsed || []),
    cost || 0
  ];
  await appendSheet(SHEET_ID, SHEET_NAME, repair);
  notifyLine(`แจ้งซ่อมใหม่: ${description}`);
  res.json({ message: 'แจ้งซ่อมสำเร็จ' });
}

// ดึงรายการแจ้งซ่อม (ตามสิทธิ์)
async function getRepairs(req, res) {
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const headers = rows[0];
  const data = rows.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  if (req.user.role === 'SuperAdmin' || req.user.role === 'Admin') {
    return res.json(data);
  }
  // User/SuperUser เห็นเฉพาะของตัวเอง
  const myRepairs = data.filter(r => r.userId == req.user.id);
  res.json(myRepairs);
}

// อัปเดตสถานะ
async function updateRepairStatus(req, res) {
  const { id, status } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == id);
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบรายการแจ้งซ่อม' });
  rows[idx][3] = status;
  rows[idx][6] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:I${idx+1}`, rows[idx]);
  notifyLine(`รายการแจ้งซ่อม #${id} เปลี่ยนสถานะเป็น ${status}`);
  res.json({ message: 'อัปเดตสถานะสำเร็จ' });
}

// มอบหมายงาน (เฉพาะ SuperAdmin)
async function assignRepair(req, res) {
  if (req.user.role !== 'SuperAdmin') return res.status(403).json({ message: 'เฉพาะ SuperAdmin เท่านั้น' });
  const { id, assignedTo } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == id);
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบรายการแจ้งซ่อม' });
  rows[idx][4] = assignedTo;
  rows[idx][6] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:I${idx+1}`, rows[idx]);
  notifyLine(`รายการแจ้งซ่อม #${id} ถูกมอบหมายให้ userId ${assignedTo}`);
  res.json({ message: 'มอบหมายงานสำเร็จ' });
}

// ประวัติแจ้งซ่อม (ของ user)
async function getRepairHistory(req, res) {
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const headers = rows[0];
  const data = rows.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  const myRepairs = data.filter(r => r.userId == req.user.id);
  res.json(myRepairs);
}

module.exports = { createRepair, getRepairs, updateRepairStatus, assignRepair, getRepairHistory }; 