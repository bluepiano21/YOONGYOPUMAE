const fs = require('fs');
const path = require('path');

const rootDir = "c:\\Users\\윤교마녀\\OneDrive - (주)예누\\vive-yenu";

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        scanDir(fullPath);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
        console.log(fullPath);
      }
    }
  }
}

console.log("Scanning workspace for images...");
scanDir(rootDir);
