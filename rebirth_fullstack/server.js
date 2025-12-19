const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'database.json');
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

// 保存成绩并生成分享 ID
app.post('/api/save', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        const shareId = Math.random().toString(36).substring(2, 8);
        const newRecord = { shareId, ...req.body, date: new Date().toISOString() };
        data.push(newRecord);
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        res.json({ shareId });
    } catch (e) { res.status(500).json({ error: "Server Error" }); }
});

// 获取排行榜
app.get('/api/rank', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        const top10 = data.sort((a, b) => b.score - a.score).slice(0, 10);
        res.json(top10);
    } catch (e) { res.status(500).json({ error: "Rank Error" }); }
});

// 查询单条分享
app.get('/api/share/:sid', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        const record = data.find(r => r.shareId === req.params.sid);
        record ? res.json(record) : res.status(404).json({ error: "Not Found" });
    } catch (e) { res.status(500).json({ error: "Share Error" }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));