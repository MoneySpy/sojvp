const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');
const { getSheet, appendSheet } = require('../utils/googleSheets');

const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../../public/fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../../public/fonts/Roboto-Bold.ttf'),
    italics: path.join(__dirname, '../../public/fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../../public/fonts/Roboto-BoldItalic.ttf')
  }
};
const printer = new PdfPrinter(fonts);

const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // TODO: ใส่ Spreadsheet ID จริง
const SHEET_NAME = 'purchase_orders'; // หรือชื่อ sheet ที่ใช้จริง

async function generatePurchaseOrderPDF(req, res) {
  const { items, total, note } = req.body;
  
  const docDefinition = {
    content: [
      { text: 'ใบสั่งซื้ออุปกรณ์', style: 'header' },
      { text: `วันที่: ${new Date().toLocaleDateString('th-TH')}`, margin: [0, 10, 0, 20] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['รายการ', 'จำนวน', 'ราคาต่อหน่วย', 'ราคารวม'],
            ...items.map(item => [
              item.name,
              item.quantity,
              item.price.toLocaleString(),
              (item.quantity * item.price).toLocaleString()
            ])
          ]
        }
      },
      { text: `รวมทั้งหมด: ${total.toLocaleString()} บาท`, style: 'total', margin: [0, 20, 0, 0] },
      note ? { text: `หมายเหตุ: ${note}`, margin: [0, 10, 0, 0] } : {}
    ],
    styles: {
      header: { fontSize: 18, bold: true, alignment: 'center' },
      total: { fontSize: 14, bold: true }
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const filename = `purchase_order_${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../../public/', filename);
  const stream = fs.createWriteStream(filePath);
  
  pdfDoc.pipe(stream);
  pdfDoc.end();
  
  stream.on('finish', async () => {
    // บันทึกข้อมูลลง Google Sheets
    const purchaseOrder = [
      Date.now(), // id (timestamp)
      filename,
      JSON.stringify(items),
      total,
      note || '',
      new Date().toISOString(),
      req.user.id // userId
    ];
    await appendSheet(SHEET_ID, SHEET_NAME, purchaseOrder);
    
    res.json({ message: 'สร้าง PDF สำเร็จ', url: `/public/${filename}` });
  });
}

async function getPurchaseOrderHistory(req, res) {
  const rows = await getSheet(SHEET_ID, SHEET_NAME);
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  
  // กรองตามสิทธิ์
  if (req.user.role === 'SuperAdmin' || req.user.role === 'Admin') {
    return res.json(data);
  }
  // User ธรรมดาเห็นเฉพาะของตัวเอง
  const myOrders = data.filter(order => order.userId == req.user.id);
  res.json(myOrders);
}

module.exports = { generatePurchaseOrderPDF, getPurchaseOrderHistory }; 