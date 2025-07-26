const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// TODO: เพิ่ม API สำหรับแต่ละฟีเจอร์

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
