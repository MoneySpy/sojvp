// authController.js
// TODO: เพิ่มฟังก์ชัน login/logout/register/change password
// register: สมัครสมาชิก
// login: เข้าสู่ระบบ
// getProfile: ดูโปรไฟล์
// updateProfile: แก้ไขโปรไฟล์
// changePassword: เปลี่ยนรหัสผ่าน
// uploadProfileImage: อัปโหลดรูปโปรไฟล์
// uploadSignatureImage: อัปโหลดรูปลายเซ็น

const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const { getSheet, appendSheet, updateSheetRow } = require('../utils/googleSheets');
const path = require('path');

const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // TODO: ใส่ Spreadsheet ID จริง
const SHEET_NAME = 'users'; // หรือชื่อ sheet ที่ใช้จริง

// Register
async function register(req, res) {
  const { username, password, role } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  if (data.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = [
    Date.now(), // id (timestamp)
    username,
    hash,
    role || 'User',
    '', // profileImage
    '', // signatureImage
    new Date().toISOString(),
    new Date().toISOString()
  ];
  await appendSheet(SHEET_ID, SHEET_NAME, user);
  res.json({ message: 'Registered successfully' });
}

// Login
async function login(req, res) {
  const { username, password } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  const user = data.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  const token = signToken({ id: user.id, username: user.username, role: user.role });
  res.json({ token });
}

// Get Profile
async function getProfile(req, res) {
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  const user = data.find(u => u.id == req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, username: user.username, role: user.role });
}

// Update Profile
async function updateProfile(req, res) {
  const { username } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  if (username) rows[idx][1] = username;
  rows[idx][7] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:H${idx+1}`, rows[idx]);
  res.json({ message: 'Profile updated' });
}

// Change Password
async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  const match = await bcrypt.compare(oldPassword, rows[idx][2]);
  if (!match) return res.status(400).json({ message: 'Old password incorrect' });
  rows[idx][2] = await bcrypt.hash(newPassword, 10);
  rows[idx][7] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:H${idx+1}`, rows[idx]);
  res.json({ message: 'Password changed successfully' });
}

// Upload Profile Image (real file)
async function uploadProfileImage(req, res) {
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  rows[idx][4] = `/public/uploads/${req.file.filename}`;
  rows[idx][7] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:H${idx+1}`, rows[idx]);
  res.json({ message: 'Profile image updated', profileImage: rows[idx][4] });
}

// Upload Signature Image (real file)
async function uploadSignatureImage(req, res) {
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const idx = rows.findIndex(r => r[0] == req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  rows[idx][5] = `/public/uploads/${req.file.filename}`;
  rows[idx][7] = new Date().toISOString();
  await updateSheetRow(SHEET_ID, `${SHEET_NAME}!A${idx+1}:H${idx+1}`, rows[idx]);
  res.json({ message: 'Signature image updated', signatureImage: rows[idx][5] });
}

module.exports = { register, login, getProfile, updateProfile, changePassword, uploadProfileImage, uploadSignatureImage };
