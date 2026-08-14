const fs = require('fs');
const path = 'src/pages/member/MySubscriptionPage.tsx';
let content = fs.readFileSync(path, 'latin1'); // Read as latin1
let fixedContent = Buffer.from(content, 'latin1').toString('utf8'); // Decode to utf8

// We might have double encoded. Let's see if fixedContent looks right.
fs.writeFileSync('temp.txt', fixedContent, 'utf8');
