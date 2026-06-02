const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/page.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("File loaded. Total lines:", lines.length);

lines.forEach((line, index) => {
  if (line.includes('Toss') || line.includes('test_ck') || line.includes('payment')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
