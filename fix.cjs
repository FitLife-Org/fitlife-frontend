const fs = require('fs');

let c = fs.readFileSync('src/hooks/useUserManagement.ts', 'utf8');
c = c.replace(/status:\s*"ACTIVE",\s*/g, '');
c = c.replace(/status:\s*member\.status,\s*/g, '');
c = c.replace(/member\.status === "LOCKED"/g, 'member.status === "SUSPENDED"');
c = c.replace(/member\.status === "PENDING"/g, 'member.status === "INACTIVE"');
c = c.replace(/newStatus:\s*Status\s*=/g, 'newStatus: any =');
c = c.replace(/currentlyLocked\s*\?\s*"ACTIVE"\s*:\s*"LOCKED"/g, 'currentlyLocked ? "ACTIVE" : "SUSPENDED"');

const regexUpdate = /const updatedMember =[\s\S]*?await memberService\s*\.updateMember\([\s\S]*?member\.id,[\s\S]*?\{\s*status:\s*newStatus\s*\},[\s\S]*?\);[\s\S]*?setMembers\(\(previous\)\s*=>[\s\S]*?previous\.map\(\(item\)\s*=>[\s\S]*?item\.id === updatedMember\.id[\s\S]*?\? updatedMember[\s\S]*?: item,[\s\S]*?\),[\s\S]*?\);/g;

c = c.replace(regexUpdate, 'await memberService.updateMemberStatus(member.id, { status: newStatus });\nsetMembers((previous) => previous.map((item) => item.id === member.id ? { ...item, status: newStatus } : item));');

fs.writeFileSync('src/hooks/useUserManagement.ts', c);

let u = fs.readFileSync('src/pages/admin/UserManagementPage.tsx', 'utf8');
u = u.replace(/const totalItems = \w+\.suspendedCount;/g, '');
u = u.replace(/const totalItems = \w+\.inactiveCount;/g, '');
u = u.replace(/suspendedCount,/g, '');
u = u.replace(/inactiveCount,/g, '');
u = u.replace(/suspendedCount:/g, '');
u = u.replace(/inactiveCount:/g, '');
u = u.replace(/SetStateAction<Status \| "ALL">/g, 'any');
fs.writeFileSync('src/pages/admin/UserManagementPage.tsx', u);
