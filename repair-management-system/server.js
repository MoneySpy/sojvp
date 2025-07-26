
const express = require('express');
const bodyParser = require('body-parser');
const sendRepairNotification = require('./sendMail');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/notify', async (req, res) => {
    const { to, subject, message } = req.body;
    try {
        await sendRepairNotification(to, subject, message);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
