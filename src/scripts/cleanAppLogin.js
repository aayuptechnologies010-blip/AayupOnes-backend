const fs = require('fs');
const p = 'd:/Aayup Projects/AayupOnes Login/App/lib/features/auth/login_screen.dart';
let c = fs.readFileSync(p, 'utf8');
c = c.replace("TextEditingController(text: 'AAYUP-DEV-0024')", 'TextEditingController()')
     .replace("TextEditingController(text: 'temp@1234')", 'TextEditingController()');
fs.writeFileSync(p, c);
console.log('Cleaned login controllers successfully');

