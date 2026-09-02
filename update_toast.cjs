const fs = require('fs');

const dir = 'src/pages/member';
const files = fs.readdirSync(dir)
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map(f => dir + '/' + f);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('react-hot-toast')) {
    // Replace import
    content = content.replace(/import toast from "react-hot-toast";/g, 'import { showAlert } from "../../utils/alert";');
    
    // Replace calls
    content = content.replace(/toast\.success\(/g, 'void showAlert.success("Thành công", ');
    content = content.replace(/toast\.error\(/g, 'void showAlert.error("Đã xảy ra lỗi", ');

    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
}
