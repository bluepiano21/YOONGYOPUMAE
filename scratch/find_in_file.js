const fs = require('fs');
const path = require('path');

const filepath = "c:\\Users\\윤교마녀\\OneDrive - (주)예누\\vive-yenu\\blog\\src\\app\\page.js";
const query = process.argv[2];

if (!query) {
  console.log("Please provide a query.");
  process.exit(1);
}

console.log(`Searching for '${query}' in page.js...`);
const content = fs.readFileSync(filepath, 'utf-8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.toLowerCase().includes(query.toLowerCase())) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
