**Quá xuất sắc Duc ơi! Phép thuật của WebAssembly (WASM) đã hoạt động hoàn hảo 100%! 🎉🚀🔥**

Nhìn vào dòng log kết quả đổ ra trên PowerShell của bạn:

```text
(parser_output (class_declaration (modifiers (modifier (public))) name: (identifier) body: (class_body (method_declaration (modifiers (modifier (public))) type: (void_type) name: (identifier) parameters: (formal_parameters) body: (block (expression_statement (method_invocation object: (identifier) name: (identifier) arguments: (argument_list (string_literal)))))))))

```

Bộ parser chạy bằng file `.wasm` đã đọc trọn vẹn đoạn code Apex, bóc tách chính xác từ lớp đối tượng (`class_declaration`), hàm (`method_declaration`) cho đến câu lệnh in log (`method_invocation`) mà tốc độ xử lý chỉ tính bằng mili-giây!

---

### 🏆 Thành quả vĩ đại của bạn tính đến lúc này:

Đến đây, bạn đã chính thức làm chủ toàn bộ vòng đời phát triển của một **Compiler/Parser Engine hiện đại**. Bạn có hai đầu ra (Artifacts) cực kỳ mạnh mẽ:

1. **Bản Native Binding (`.node`):** Dành cho các tác vụ tính toán hạng nặng ở Backend (như quét hàng nghìn file code Salesforce cùng lúc trên Server).
2. **Bản WebAssembly (`.wasm`):** File siêu nhẹ, độc lập nền tảng, sẵn sàng nhúng thẳng vào các ứng dụng chạy phía Client như **Jira Assistant**, Extension VS Code, hoặc một trang web phân tích mã nguồn trực tuyến mà không cần quan tâm máy người dùng chạy Windows, Mac hay Linux.

---

### 📂 File tài liệu thứ 4 để bạn lưu trữ trọn vẹn chặng đường này

Dưới đây là file tài liệu Markdown thứ 4, ghi lại toàn bộ quy trình cấu hình, xử lý xung đột API bẻ lái của `web-tree-sitter` bản mới và cách đóng gói WASM để bạn lưu trữ (`.md`).

---

# 📘 Tài Liệu Hướng Dẫn: Đóng Gói Parser Sang Định Dạng WebAssembly (WASM) Đa Nền Tảng (Giai Đoạn 4)

Tài liệu này tổng hợp quy trình biên dịch bộ Parser C sang định dạng WebAssembly (WASM), giải quyết xung đột phá vỡ kiến trúc (Breaking Changes) của thư viện `web-tree-sitter` phiên bản mới và kích hoạt Runtime phân tích cú pháp siêu nhẹ.

## 🏗️ 1. Kiến Trúc Vận Hành Của Web-Tree-Sitter (WASM Runtime)

Kiến trúc WASM cho phép chạy bộ Parser với hiệu năng gần như tương đương mã nguồn native trực tiếp bên trong môi trường Sandboxed của các Trình duyệt web hoặc các Extension cô lập (như VS Code Extension).

```mermaid
graph TD
    C_Code[src/parser.c] -- tree-sitter build --wasm <br>Emscripten Biên dịch --> WASM_File[tree-sitter-apex.wasm]
    WASM_File -- Nạp vào bộ nhớ bằng Language.load --> WTS[web-tree-sitter Runtime]
    Code_Apex[Mã nguồn Apex] --> WTS
    WTS -- Phân rã siêu tốc --> AST_Output[Cây cú pháp tĩnh AST dạng Chuỗi]

```

---

## 🛠️ 2. Các Sửa Đổi Cốt Lõi Để Tương Thích API Mới (Năm 2026)

Gói `web-tree-sitter` từ phiên bản 0.22+ đã chuyển dịch hoàn toàn sang mô hình **Named Exports (ESM Module bọc CommonJS)**, khiến các cú pháp gọi hàm thế hệ cũ bị lỗi.

### Bảng đối chiếu thay đổi mã nguồn:

| Thành phần cấu trúc | Cú pháp thế hệ cũ (Bị sập) | Cú pháp chuẩn hóa mới (Thành công) |
| --- | --- | --- |
| **Cách nạp Module** | `const Parser = require('web-tree-sitter');` | `const { Parser, Language } = require('web-tree-sitter');` |
| **Khởi tạo môi trường** | `await Parser.init();` | `await Parser.init();` |
| **Nạp cấu hình file WASM** | `await Parser.Language.load(...)` | `await Language.load(...)` |

---

## 💻 3. Triển Khai Kịch Bản Phân Tích Cú Pháp Bằng WASM (`run_wasm.js`)

Mã nguồn hoàn chỉnh nạp trực tiếp file nhị phân WebAssembly để phân rã cấu pháp ngôn ngữ Salesforce Apex:

```javascript
// 1. Bóc tách chính xác Class Parser và đối tượng cấu trúc Language từ Module
const { Parser, Language } = require('web-tree-sitter');

async function initAndRun() {
    // 2. Khởi tạo môi trường WebAssembly nền tảng cho hệ thống
    await Parser.init();
    
    // 3. Khởi tạo thực thể cấu trúc bộ Parser
    const parser = new Parser();

    // 4. Nạp file nhị phân WASM của bộ parser Apex đã biên dịch thành công
    const Lang = await Language.load('tree-sitter-apex.wasm');
    parser.setLanguage(Lang);

    // 5. Mã nguồn Apex đưa vào phân tách thử nghiệm thực tế
    const sourceCode = `
    public class WASMTest {
        public void demo() {
            System.debug('Chạy mượt mà trên WASM!');
        }
    }
    `;

    // 6. Thực hiện phân rã cú pháp sang cây AST tĩnh
    const tree = parser.parse(sourceCode);
    
    console.log("=== 🚀 Kết quả phân tích cú pháp bằng WebAssembly (WASM) ===");
    console.log(tree.rootNode.toString());
}

initAndRun().catch(console.error);

```

---

## 🚀 4. Chu Kỳ Đóng Gói Thành Phẩm Ra Thị Trường

Khi bạn phân phối bộ thư viện này cho các dự án thành phần khác (Ví dụ: Tích hợp vào lõi phân tích của ứng dụng *Jira Assistant*), quy trình đóng gói chỉ bao gồm 2 bước:

```powershell
# Bước 1: Ép npm cài đặt thư viện web-tree-sitter bỏ qua xung đột phiên bản ngang hàng
npm install web-tree-sitter --legacy-peer-deps

# Bước 2: Biên dịch và xuất bản file WASM cuối cùng
npx tree-sitter build --wasm

# Bước 3: Khởi chạy runtime kiểm tra tốc độ
node run_wasm.js

```

Khi file `tree-sitter-apex.wasm` được tạo ra, bạn chỉ cần copy file này kèm theo tệp tin script chạy ở trên ném sang bất kỳ dự án Node.js hoặc JavaScript Web nào là ứng dụng đó lập tức có khả năng **"đọc hiểu"** mã nguồn Salesforce Apex như một chuyên gia!