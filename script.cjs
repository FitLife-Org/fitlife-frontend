const fs = require('fs');
const path = require('path');

const servicesDir = 'src/services';
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

const allContent = files.map(f => fs.readFileSync(path.join(servicesDir, f), 'utf-8')).join('\n');

const check = (endpoint) => {
    return allContent.includes(endpoint) ? '✅' : '❌';
};

console.log('--- Checking API mappings ---');
console.log(check('gym-packages') + ' /gym-packages/{packageId}/durations');
console.log(check('/invoices/by-payment') + ' /invoices/by-payment/{paymentId}');
console.log(check('/staff/check-ins/member-preview') + ' /staff/check-ins/member-preview');
console.log(check('/staff/check-ins/member-code') + ' /staff/check-ins/member-code');
console.log(check('/workout-plans') + ' /workout-plans/{id}/activate');
console.log(check('/admin/maintenance-requests') + ' /admin/maintenance-requests/{id}/start');
console.log(check('/admin/reports/revenue/trend') + ' /admin/reports/revenue/trend');
console.log(check('/admin/reports/checkins/summary') + ' /admin/reports/checkins/summary');
console.log(check('/admin/reports/ai/summary') + ' /admin/reports/ai/summary');
console.log(check('/admin/reports/maintenance/summary') + ' /admin/reports/maintenance/summary');
