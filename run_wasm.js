// 1. Bóc tách chính xác Class Parser và hàm khởi tạo init từ module
const { Parser, Language } = require('web-tree-sitter');

async function initAndRun() {
    // 2. Khởi tạo môi trường WebAssembly nền tảng
    await Parser.init();
    
    // 3. Khởi tạo thực thể cấu trúc bộ Parser
    const parser = new Parser();

    // 4. Nạp file file WASM của bộ parser Apex mà bạn đã biên dịch thành công
    const Lang = await Language.load('tree-sitter-apex.wasm');
    parser.setLanguage(Lang);

    // 5. Mã nguồn Apex đưa vào chạy thử nghiệm thực tế
    const sourceCode = `
    public class WASMTest {
        public void demo() {
            System.debug('Chạy mượt mà trên WASM!');
        }
    }
    `;

    // 6. Thực hiện phân rã cú pháp
    const tree = parser.parse(sourceCode);
    
    console.log("=== 🚀 Kết quả phân tích cú pháp bằng WebAssembly (WASM) ===");
    console.log(tree.rootNode.toString());
}

initAndRun().catch(console.error);