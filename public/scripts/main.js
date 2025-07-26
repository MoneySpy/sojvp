// main.js
// SPA: Login/Register/Profile + เมนู

function setAuthMenu() {
  const token = localStorage.getItem('token');
  const authMenu = document.getElementById('auth-menu');
  if (token) {
    authMenu.innerHTML = '<a href="#" onclick="logout()">ออกจากระบบ</a>';
  } else {
    authMenu.innerHTML = '<a href="#" onclick="showLogin()">เข้าสู่ระบบ</a> | <a href="#" onclick="showRegister()">สมัครสมาชิก</a>';
  }
}

function showLogin() {
  document.getElementById('app').innerHTML = `
    <h2>เข้าสู่ระบบ</h2>
    <form onsubmit="login(event)">
      <input type="text" id="login-username" placeholder="ชื่อผู้ใช้" required><br><br>
      <input type="password" id="login-password" placeholder="รหัสผ่าน" required><br><br>
      <button type="submit">เข้าสู่ระบบ</button>
    </form>
    <p>ยังไม่มีบัญชี? <a href="#" onclick="showRegister()">สมัครสมาชิก</a></p>
  `;
}

function showRegister() {
  document.getElementById('app').innerHTML = `
    <h2>สมัครสมาชิก</h2>
    <form onsubmit="register(event)">
      <input type="text" id="reg-username" placeholder="ชื่อผู้ใช้" required><br><br>
      <input type="password" id="reg-password" placeholder="รหัสผ่าน" required><br><br>
      <button type="submit">สมัครสมาชิก</button>
    </form>
    <p>มีบัญชีแล้ว? <a href="#" onclick="showLogin()">เข้าสู่ระบบ</a></p>
  `;
}

function showProfile() {
  const token = localStorage.getItem('token');
  if (!token) return showLogin();
  fetch('/api/auth/profile', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => res.json())
    .then(user => {
      document.getElementById('app').innerHTML = `
        <h2>โปรไฟล์</h2>
        <p>ชื่อผู้ใช้: ${user.username}</p>
        <p>สิทธิ์: ${user.role}</p>
        <button onclick="logout()">ออกจากระบบ</button>
      `;
    });
}

function login(e) {
  e.preventDefault();
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: document.getElementById('login-username').value,
      password: document.getElementById('login-password').value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        setAuthMenu();
        showDashboard();
      } else {
        alert(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    });
}

function register(e) {
  e.preventDefault();
  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: document.getElementById('reg-username').value,
      password: document.getElementById('reg-password').value
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      showLogin();
    });
}

function logout() {
  localStorage.removeItem('token');
  setAuthMenu();
  showLogin();
}

function showDashboard() {
  document.getElementById('app').innerHTML = `
    <h2>Dashboard</h2>
    <canvas id="repairChart" width="400" height="200"></canvas>
    <canvas id="expenseChart" width="400" height="200"></canvas>
  `;
  loadDashboardCharts();
}

function loadDashboardCharts() {
  const token = localStorage.getItem('token');
  if (!token) return;
  // จำนวนแจ้งซ่อม
  fetch('/api/dashboard/monthly-repair-stats', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => res.json())
    .then(stats => {
      const labels = Object.keys(stats);
      const data = Object.values(stats);
      new Chart(document.getElementById('repairChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'จำนวนแจ้งซ่อม/เดือน', data, backgroundColor: '#52b788' }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    });
  // ค่าใช้จ่าย
  fetch('/api/dashboard/monthly-expense-stats', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => res.json())
    .then(stats => {
      const labels = Object.keys(stats);
      const data = Object.values(stats);
      new Chart(document.getElementById('expenseChart').getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [{ label: 'ค่าใช้จ่าย/เดือน (บาท)', data, borderColor: '#40916c', backgroundColor: 'rgba(64,145,108,0.1)', fill: true }]
        },
        options: { responsive: true }
      });
    });
}
function showRepair() {
  const token = localStorage.getItem('token');
  if (!token) return showLogin();
  document.getElementById('app').innerHTML = `
    <h2>แจ้งซ่อม</h2>
    <form onsubmit="submitRepair(event)">
      <input type="text" id="repair-desc" placeholder="รายละเอียดปัญหา" required><br><br>
      <input type="number" id="repair-cost" placeholder="ค่าใช้จ่ายโดยประมาณ (บาท)"><br><br>
      <button type="submit">แจ้งซ่อม</button>
    </form>
    <div id="repair-result"></div>
    <button onclick="showRepairHistory()">ดูประวัติแจ้งซ่อมของฉัน</button>
  `;
}

function showRepairHistory() {
  const token = localStorage.getItem('token');
  if (!token) return showLogin();
  document.getElementById('app').innerHTML = '<h2>ประวัติแจ้งซ่อมของฉัน</h2><p>กำลังโหลด...</p>';
  fetch('/api/repairs/history', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => res.json())
    .then(list => {
      if (!Array.isArray(list) || list.length === 0) {
        document.getElementById('app').innerHTML = '<h2>ประวัติแจ้งซ่อมของฉัน</h2><p>ไม่พบข้อมูล</p><button onclick="showRepair()">กลับ</button>';
        return;
      }
      let html = `<h2>ประวัติแจ้งซ่อมของฉัน</h2><table border='1' cellpadding='6' style='border-collapse:collapse;'><tr><th>วันที่</th><th>รายละเอียด</th><th>สถานะ</th><th>ค่าใช้จ่าย</th></tr>`;
      for (const r of list) {
        html += `<tr><td>${new Date(r.createdAt).toLocaleString()}</td><td>${r.description}</td><td>${r.status}</td><td>${r.cost || '-'}</td></tr>`;
      }
      html += '</table><br><button onclick="showRepair()">กลับ</button>';
      document.getElementById('app').innerHTML = html;
    });
}
function showStock() {
  const token = localStorage.getItem('token');
  if (!token) return showLogin();
  document.getElementById('app').innerHTML = `
    <h2>สต็อกอะไหล่</h2>
    <form onsubmit="addStock(event)">
      <input type="text" id="stock-name" placeholder="ชื่ออะไหล่" required>
      <input type="number" id="stock-qty" placeholder="จำนวน" required style="width:80px">
      <input type="text" id="stock-unit" placeholder="หน่วย" required style="width:80px">
      <input type="number" id="stock-min" placeholder="Min Stock" style="width:80px">
      <button type="submit">เพิ่มอะไหล่</button>
    </form>
    <div id="stock-result"></div>
    <div id="stock-list">กำลังโหลด...</div>
  `;
  loadStockList();
}

function loadStockList() {
  const token = localStorage.getItem('token');
  fetch('/api/stocks/list', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => res.json())
    .then(list => {
      if (!Array.isArray(list) || list.length === 0) {
        document.getElementById('stock-list').innerHTML = '<p>ไม่มีข้อมูลอะไหล่</p>';
        return;
      }
      let html = `<table border='1' cellpadding='6' style='border-collapse:collapse;'><tr><th>ชื่อ</th><th>จำนวน</th><th>หน่วย</th><th>Min</th><th>จัดการ</th></tr>`;
      for (const s of list) {
        html += `<tr>
          <td>${s.name}</td>
          <td>${s.quantity}</td>
          <td>${s.unit}</td>
          <td>${s.minStock || '-'}</td>
          <td>
            <button onclick="deleteStock(${s.id})">ลบ</button>
            <button onclick="editStockPrompt(${s.id}, '${s.name}', ${s.quantity}, '${s.unit}', ${s.minStock || 0})">แก้ไข</button>
          </td>
        </tr>`;
      }
      html += '</table>';
      document.getElementById('stock-list').innerHTML = html;
    });
}

function addStock(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  fetch('/api/stocks/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      name: document.getElementById('stock-name').value,
      quantity: document.getElementById('stock-qty').value,
      unit: document.getElementById('stock-unit').value,
      minStock: document.getElementById('stock-min').value
    })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('stock-result').innerHTML = data.message ? `<span style='color:green'>${data.message}</span>` : `<span style='color:red'>${data.error || 'เกิดข้อผิดพลาด'}</span>`;
      if (data.message) {
        document.getElementById('stock-name').value = '';
        document.getElementById('stock-qty').value = '';
        document.getElementById('stock-unit').value = '';
        document.getElementById('stock-min').value = '';
        loadStockList();
      }
    });
}

function deleteStock(id) {
  const token = localStorage.getItem('token');
  if (!confirm('ยืนยันการลบอะไหล่นี้?')) return;
  fetch('/api/stocks/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ id })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('stock-result').innerHTML = data.message ? `<span style='color:green'>${data.message}</span>` : `<span style='color:red'>${data.error || 'เกิดข้อผิดพลาด'}</span>`;
      loadStockList();
    });
}

function editStockPrompt(id, name, qty, unit, minStock) {
  const newName = prompt('ชื่ออะไหล่', name);
  if (newName === null) return;
  const newQty = prompt('จำนวน', qty);
  if (newQty === null) return;
  const newUnit = prompt('หน่วย', unit);
  if (newUnit === null) return;
  const newMin = prompt('Min Stock', minStock);
  if (newMin === null) return;
  editStock(id, newName, newQty, newUnit, newMin);
}

function editStock(id, name, quantity, unit, minStock) {
  const token = localStorage.getItem('token');
  fetch('/api/stocks/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ id, name, quantity, unit, minStock })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('stock-result').innerHTML = data.message ? `<span style='color:green'>${data.message}</span>` : `<span style='color:red'>${data.error || 'เกิดข้อผิดพลาด'}</span>`;
      loadStockList();
    });
}
function showEquipment() {
  const token = localStorage.getItem('token');
  if (!token) return showLogin();
  document.getElementById('app').innerHTML = `
    <h2>ครุภัณฑ์</h2>
    <form onsubmit="addEquipment(event)">
      <input type="text" id="eq-name" placeholder="ชื่อครุภัณฑ์" required>
      <input type="text" id="eq-status" placeholder="สถานะ (พร้อมใช้งาน/ชำรุด)" required style="width:120px">
      <input type="text" id="eq-location" placeholder="สถานที่" style="width:120px">
      <button type="submit">เพิ่มครุภัณฑ์</button>
    </form>
    <div id="eq-result"></div>
    <div id="eq-list">กำลังโหลด...</div>
  `;
  loadEquipmentList();
}

function loadEquipmentList() {
  const token = localStorage.getItem('token');
  fetch('/api/equipments/list', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => res.json())
    .then(list => {
      if (!Array.isArray(list) || list.length === 0) {
        document.getElementById('eq-list').innerHTML = '<p>ไม่มีข้อมูลครุภัณฑ์</p>';
        return;
      }
      let html = `<table border='1' cellpadding='6' style='border-collapse:collapse;'><tr><th>ชื่อ</th><th>สถานะ</th><th>สถานที่</th><th>วันที่เพิ่ม</th><th>จัดการ</th></tr>`;
      for (const e of list) {
        html += `<tr>
          <td>${e.name}</td>
          <td>${e.status}</td>
          <td>${e.location || '-'}</td>
          <td>${e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '-'}</td>
          <td>
            <button onclick="deleteEquipment(${e.id})">ลบ</button>
            <button onclick="editEquipmentPrompt(${e.id}, '${e.name}', '${e.status}', '${e.location || ''}')">แก้ไข</button>
            <button onclick="updateEquipmentStatusPrompt(${e.id}, '${e.status}')">ปรับสถานะ</button>
          </td>
        </tr>`;
      }
      html += '</table>';
      document.getElementById('eq-list').innerHTML = html;
    });
}

function addEquipment(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  fetch('/api/equipments/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      name: document.getElementById('eq-name').value,
      status: document.getElementById('eq-status').value,
      location: document.getElementById('eq-location').value
    })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('eq-result').innerHTML = data.message ? `<span style='color:green'>${data.message}</span>` : `<span style='color:red'>${data.error || 'เกิดข้อผิดพลาด'}</span>`;
      if (data.message) {
        document.getElementById('eq-name').value = '';
        document.getElementById('eq-status').value = '';
        document.getElementById('eq-location').value = '';
        loadEquipmentList();
      }
    });
}

function deleteEquipment(id) {
  const token = localStorage.getItem('token');
  if (!confirm('ยืนยันการลบครุภัณฑ์นี้?')) return;
  fetch('/api/equipments/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ id })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('eq-result').innerHTML = data.message ? `<span style='color:green'>${data.message}</span>` : `<span style='color:red'>${data.error || 'เกิดข้อผิดพลาด'}</span>`;
      loadEquipmentList();
    });
}

function editEquipmentPrompt(id, name, status, location) {
  const newName = prompt('ชื่อครุภัณฑ์', name);
  if (newName === null) return;
  const newStatus = prompt('สถานะ', status);
  if (newStatus === null) return;
  const newLocation = prompt('สถานที่', location);
  if (newLocation === null) return;
  editEquipment(id, newName, newStatus, newLocation);
}

function editEquipment(id, name, status, location) {
  const token = localStorage.getItem('token');
  fetch('/api/equipments/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ id, name, status, location })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('eq-result').innerHTML = data.message ? `<span style='color:green'>${data.message}</span>` : `<span style='color:red'>${data.error || 'เกิดข้อผิดพลาด'}</span>`;
      loadEquipmentList();
    });
}

function updateEquipmentStatusPrompt(id, currentStatus) {
  const newStatus = prompt('ปรับสถานะ (พร้อมใช้งาน/ชำรุด)', currentStatus);
  if (newStatus === null) return;
  updateEquipmentStatus(id, newStatus);
}

function updateEquipmentStatus(id, status) {
  const token = localStorage.getItem('token');
  fetch('/api/equipments/update-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ id, status })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('eq-result').innerHTML = data.message ? `<span style='color:green'>${data.message}</span>` : `<span style='color:red'>${data.error || 'เกิดข้อผิดพลาด'}</span>`;
      loadEquipmentList();
    });
}
function showPurchase() {
  const token = localStorage.getItem('token');
  if (!token) return showLogin();
  document.getElementById('app').innerHTML = `
    <h2>สร้างใบสั่งซื้ออุปกรณ์</h2>
    <form id="purchase-form" onsubmit="generatePurchaseOrder(event)">
      <div id="purchase-items">
        <div>
          <input type="text" placeholder="ชื่ออุปกรณ์" class="item-name" required>
          <input type="number" placeholder="จำนวน" class="item-qty" required style="width:80px">
          <input type="text" placeholder="หน่วย" class="item-unit" required style="width:80px">
        </div>
      </div>
      <button type="button" onclick="addPurchaseItem()">+ เพิ่มรายการ</button><br><br>
      <input type="number" id="purchase-total" placeholder="รวมเป็นเงิน (บาท)" required><br><br>
      <input type="text" id="purchase-note" placeholder="หมายเหตุ"><br><br>
      <button type="submit">สร้างใบสั่งซื้อ PDF</button>
    </form>
    <div id="purchase-result"></div>
    <button onclick="showPurchaseHistory()">ดูประวัติใบสั่งซื้อ</button>
    <div id="purchase-history"></div>
  `;
}

function addPurchaseItem() {
  const div = document.createElement('div');
  div.innerHTML = `
    <input type="text" placeholder="ชื่ออุปกรณ์" class="item-name" required>
    <input type="number" placeholder="จำนวน" class="item-qty" required style="width:80px">
    <input type="text" placeholder="หน่วย" class="item-unit" required style="width:80px">
    <button type="button" onclick="this.parentNode.remove()">ลบ</button>
  `;
  document.getElementById('purchase-items').appendChild(div);
}

function generatePurchaseOrder(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const items = Array.from(document.querySelectorAll('#purchase-items > div')).map(div => ({
    name: div.querySelector('.item-name').value,
    qty: div.querySelector('.item-qty').value,
    unit: div.querySelector('.item-unit').value
  }));
  fetch('/api/pdf/generate-purchase-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      items,
      total: document.getElementById('purchase-total').value,
      note: document.getElementById('purchase-note').value
    })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('purchase-result').innerHTML = data.url ? `<a href="${data.url}" target="_blank">ดาวน์โหลด PDF</a>` : `<span style='color:red'>${data.error || 'เกิดข้อผิดพลาด'}</span>`;
    });
}

function showPurchaseHistory() {
  const token = localStorage.getItem('token');
  document.getElementById('purchase-history').innerHTML = 'กำลังโหลด...';
  fetch('/api/pdf/purchase-order-history', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => res.json())
    .then(list => {
      if (!Array.isArray(list) || list.length === 0) {
        document.getElementById('purchase-history').innerHTML = '<p>ไม่พบประวัติใบสั่งซื้อ</p>';
        return;
      }
      let html = `<h3>ประวัติใบสั่งซื้อ</h3><ul>`;
      for (const p of list) {
        html += `<li><a href="/public/${p.filename}" target="_blank">${p.filename}</a> (${new Date(p.createdAt).toLocaleString()})</li>`;
      }
      html += '</ul>';
      document.getElementById('purchase-history').innerHTML = html;
    });
}
function showUsers() {
  const token = localStorage.getItem('token');
  if (!token) return showLogin();
  // MOCK: ยังไม่มี API user management จริง
  document.getElementById('app').innerHTML = `
    <h2>ผู้ใช้งาน (ตัวอย่าง UI)</h2>
    <table border='1' cellpadding='6' style='border-collapse:collapse;'>
      <tr><th>ชื่อผู้ใช้</th><th>สิทธิ์</th><th>จัดการ</th></tr>
      <tr><td>admin</td><td>SuperAdmin</td><td><button disabled>แก้ไข</button> <button disabled>ลบ</button></td></tr>
      <tr><td>user1</td><td>User</td><td><button disabled>แก้ไข</button> <button disabled>ลบ</button></td></tr>
      <tr><td>tech1</td><td>SuperUser</td><td><button disabled>แก้ไข</button> <button disabled>ลบ</button></td></tr>
    </table>
    <br>
    <button disabled>+ เพิ่มผู้ใช้งาน</button>
    <p style='color:gray'>* ฟีเจอร์นี้ต้องเชื่อมต่อ API backend จริง</p>
  `;
}

// SPA init
setAuthMenu();
showDashboard();
