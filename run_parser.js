const Parser = require('tree-sitter');
const SfApex = require('./build/Release/tree_sitter_apex_binding.node'); 

const parser = new Parser();
parser.setLanguage(SfApex);

// 1. Đoạn code Apex thực tế bạn muốn quét (Có thể đổi thành đọc file .cls sau này)
const sourceCode = `
public class UserService {
    public void createUsers() {
        // Cú pháp giả định bị lỗi do chứa từ khóa lạ chưa định nghĩa
        insert_special_mode myAccount; 
    }
}
`;

// 2. Tiến hành parse mã nguồn thành cây AST
const tree = parser.parse(sourceCode);

// 3. Hàm quét cây cú pháp để săn lùng nút 'ERROR' hoặc 'MISSING'
function findErrors(node) {
    if (node.type === 'ERROR' || node.isMissing) {
        console.log(`❌ Phát hiện lỗi cú pháp tại dòng ${node.startPosition.row + 1}:`);
        console.log(` > Đoạn code lỗi: "${sourceCode.substring(node.startIndex, node.endIndex)}"`);
        return true;
    }

    // Duyệt qua tất cả các nút con (Children Nodes)
    for (let i = 0; i < node.childCount; i++) {
        if (findErrors(node.child(i))) return true;
    }
    return false;
}

console.log("=== 🚀 Bắt đầu quét mã nguồn Apex ===");
const hasError = findErrors(tree.rootNode);

if (!hasError) {
    console.log("✅ Tuyệt vời! Code sạch 100%, không phát sinh lỗi parser.");
    // In ra cây AST thu gọn để xem
    console.log(tree.rootNode.toString());
} else {
    console.log("\n🤖 GỢI Ý PIPELINE AI:");
    console.log(" 1. Hãy copy đoạn code lỗi trên.");
    console.log(" 2. Tra cứu luật tương ứng trong `forcedotcom/apex-parser` (ANTLR4).");
    console.log(" 3. Dùng Prompt trong Tài liệu 2 để AI sinh bản vá và điền vào `grammar.js`.");
}
