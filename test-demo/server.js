const express = require('express');
const path = require('path');
const { toRomaji, toKana, getAllInputPatterns, getSegmentedPatterns, getCompletePatterns, getPatternSets } = require('../dist/index.cjs.js');

const app = express();
const PORT = 8181;

// 静的ファイルの提供
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// APIエンドポイント
app.post('/api/toRomaji', (req, res) => {
  const { text } = req.body;
  const result = toRomaji(text);
  res.json({ result });
});

app.post('/api/toKana', (req, res) => {
  const { text } = req.body;
  const result = toKana(text);
  res.json({ result });
});

app.post('/api/getAllInputPatterns', (req, res) => {
  const { text } = req.body;
  const result = getAllInputPatterns(text);
  res.json({ result });
});

app.post('/api/getSegmentedPatterns', (req, res) => {
  const { text } = req.body;
  const result = getSegmentedPatterns(text);
  res.json({ result });
});

app.post('/api/getCompletePatterns', (req, res) => {
  const { text } = req.body;
  const result = getCompletePatterns(text);
  res.json({ result });
});

app.post('/api/getPatternSets', (req, res) => {
  const { text } = req.body;
  const result = getPatternSets(text);
  res.json({ result });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`テストサーバーが起動しました: http://localhost:${PORT}`);
}); 