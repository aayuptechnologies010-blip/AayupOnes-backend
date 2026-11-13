const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/models');

fs.readdirSync(dir).forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes("'User'") || content.includes('"User"')) {
    console.log('Found User ref in:', f);
  }
});
console.log('Scan completed.');

