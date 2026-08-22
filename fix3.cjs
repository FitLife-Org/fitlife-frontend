const fs = require('fs');
let u = fs.readFileSync('src/pages/admin/UserManagementPage.tsx', 'utf8');
u = u.replace(/const totalItems = \w+\.suspendedCount;/g, '');
u = u.replace(/const totalItems = \w+\.inactiveCount;/g, '');
u = u.replace(/suspendedCount,/g, '');
u = u.replace(/inactiveCount,/g, '');
u = u.replace(/suspendedCount:/g, '');
u = u.replace(/inactiveCount:/g, '');
u = u.replace(/SetStateAction<Status \| "ALL">/g, 'any');
// Instead of removing HTML, just replace the variable rendering with '0'
u = u.replace(/\{inactiveCount\}/g, '0');
u = u.replace(/\{suspendedCount\}/g, '0');
fs.writeFileSync('src/pages/admin/UserManagementPage.tsx', u);
