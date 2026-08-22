const fs = require('fs');

let c = fs.readFileSync('src/hooks/useUserManagement.ts', 'utf8');
c = c.replace(/status:\s*Status\s*\|/g, 'status: any |');
c = c.replace(/await memberService\.updateMemberStatus\(member\.id,\s*newStatus\)/g, 'await memberService.updateMemberStatus(member.id, { status: newStatus })');

// Fix map returning void
c = c.replace(/\? \{\s*\.\.\.item,\s*status:\s*newStatus\s*\}\s*:\s*item/g, '? { ...item, status: newStatus } : item');

// The issue with returning void might be because the previous string replacement messed up the arrow function, let's fix it by regex:
c = c.replace(/setMembers\(\(previous\)\s*=>\s*previous\.map\(\(item\)\s*=>\s*item\.id === member\.id\s*\?\s*\{\s*\.\.\.item,\s*status:\s*newStatus\s*\}\s*:\s*item\)\);/g, 'setMembers((previous) => previous.map((item) => item.id === member.id ? { ...item, status: newStatus } : item));');

// Another map might have been broken, let's just make sure updatedMember logic is sound.
c = c.replace(/const updatedMember = await memberService\.updateMemberStatus[\s\S]*?;/g, 'await memberService.updateMemberStatus(member.id, { status: newStatus }); const updatedMember = { ...member, status: newStatus };');

fs.writeFileSync('src/hooks/useUserManagement.ts', c);

let u = fs.readFileSync('src/pages/admin/UserManagementPage.tsx', 'utf8');
u = u.replace(/<div[^>]*>[\s\S]*?inactiveCount[\s\S]*?<\/div>/g, '');
u = u.replace(/<div[^>]*>[\s\S]*?suspendedCount[\s\S]*?<\/div>/g, '');
fs.writeFileSync('src/pages/admin/UserManagementPage.tsx', u);
