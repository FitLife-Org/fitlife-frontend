const fs = require('fs');
const file = 'C:\\Users\\nguye\\Downloads\\fit-front\\src\\services\\memberService.ts';
let content = fs.readFileSync(file, 'utf-8');

// Replace PUT /members/me
content = content.replace(/await apiClient\.put<\s*ApiResponse<MemberProfile>\s*>\("\/members\/me", payload\);/g, 'await apiClient.patch<\n                ApiResponse<MemberProfile>\n            >("/members/me", payload);');

// Replace PUT /admin/members/${id}
content = content.replace(/await apiClient\.put<\s*ApiResponse<MemberProfile>\s*>\(\s*`\/admin\/members\/\$\{id\}`,\s*payload,\s*\);/g, 'await apiClient.patch<\n                ApiResponse<MemberProfile>\n            >(\n                `/admin/members/${id}`,\n                payload,\n            );');

// Remove getMemberByCode
content = content.replace(/async getMemberByCode\([\s\S]*?async createMember/g, 'async createMember');

// Remove updateMemberStatus and deleteMember
content = content.replace(/async updateMemberStatus\([\s\S]*?async getMemberSubscriptions/g, 'async getMemberSubscriptions');

// Remove restoreMember
content = content.replace(/async restoreMember\([\s\S]*?};\s*$/g, '};');

fs.writeFileSync(file, content, 'utf-8');
console.log("Done");
