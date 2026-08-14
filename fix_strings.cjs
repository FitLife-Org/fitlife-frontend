const fs = require('fs');
let content = fs.readFileSync('src/pages/member/MySubscriptionPage.tsx', 'utf8');

const replacements = {
  "GĂ³i": "Gói",
  "há»™i": "hội",
  "viĂªn": "viên",
  "cá»§a": "của",
  "tĂ´i": "tôi",
  "Quáº£n": "Quản",
  "lĂ½": "lý",
  "vĂ ": "và",
  "dĂµi": "dõi",
  "cĂ¡c": "các",
  "táº­p": "tập",
  "luyá»‡n": "luyện",
  "báº¡n": "bạn",
  "Ä‘Ă£": "đã",
  "Ä‘Äƒng": "đăng",
  "kĂ½": "ký",
  "má»›i": "mới",
  "Ä ang": "Đang",
  "hoáº¡t": "hoạt",
  "Ä‘á»™ng": "động",
  "Chá» ": "Chờ",
  "thanh": "thanh",
  "toĂ¡n": "toán",
  "Ä Ă£": "Đã",
  "háº¿t": "hết",
  "háº¡n": "hạn",
  "Báº¯t": "Bắt",
  "Ä‘áº§u": "đầu",
  "ChÆ°a": "Chưa",
  "kĂ­ch": "kích",
  "Háº¿t": "Hết",
  "Thá» i": "Thời",
  "gian": "gian",
  "cĂ²n": "còn",
  "láº¡i": "lại",
  "ngĂ y": "ngày",
  "cĂ³": "có",
  "nĂ o": "nào",
  "Ä‘ang": "đang",
  "hoáº·c": "hoặc",
  "Lá»‹ch": "Lịch",
  "sá»­": "sử",
  "Ä‘áº¿n": "đến",
  "Thanh": "Thanh",
  "buá»•i": "buổi",
  "Ä‘áº¡t": "đạt",
  "mĂºc": "mức",
  "bá»›t": "bớt",
  "thĂªm": "thêm",
  "Ä‘á»ƒ": "để",
  "cĂ¹ng": "cùng",
  "tá»«": "từ",
  "nháºn": "nhận"
};

for (const [bad, good] of Object.entries(replacements)) {
  content = content.replaceAll(bad, good);
}

fs.writeFileSync('src/pages/member/MySubscriptionPage.tsx', content, 'utf8');
