/**
 * @fileoverview LWC Parsers barrel export.
 */

const { parseLWCJsFile, parseLWCJsContent } = require('./lwc-js-parser');
const { parseLWCHtmlFile, parseLWCHtmlContent } = require('./lwc-html-parser');
const { parseLWCCssFile, parseLWCCssContent } = require('./lwc-css-parser');

module.exports = {
  parseLWCJsFile,
  parseLWCJsContent,
  parseLWCHtmlFile,
  parseLWCHtmlContent,
  parseLWCCssFile,
  parseLWCCssContent
};
