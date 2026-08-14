const fs = require('fs');
const path = 'src/pages/member/MySubscriptionPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Convert string to bytes by taking char code of each character
let bytes = new Uint8Array(content.length);
for (let i = 0; i < content.length; i++) {
    bytes[i] = content.charCodeAt(i) & 0xff;
}

let fixedContent = Buffer.from(bytes).toString('utf8');
fs.writeFileSync('temp.txt', fixedContent, 'utf8');
