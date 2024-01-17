const fs = require('fs');
const path = require('path');

let swFile  = fs.readFileSync(path.join(__dirname, 'public', 'firebase-messaging-sw.js'), 'utf8');
swFile  = swFile .replace('%REACT_APP_ENCODED_FIREBASE_CONFIG%', process.env.REACT_APP_FIREBASE_CONFIG);

fs.writeFileSync(path.join(__dirname, 'public', 'firebase-messaging-sw.js'), swFile);