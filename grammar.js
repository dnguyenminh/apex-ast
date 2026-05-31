// Trỏ trực tiếp vào file grammar.js nằm trong thư mục nguồn đầy đủ cấu trúc
const apexGrammar = require('./sfapex-source/apex/grammar.js');

module.exports = grammar(apexGrammar, {
  name: 'apex',

  rules: {
    // Để trống để kế thừa 100% từ bộ nguồn đầy đủ
  }
});