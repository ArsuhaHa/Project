const { readFileSync } = require("node:fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

class Template {
  constructor(filename, options) {
    this.filename = filename;
    this.doc = this._readDoc(filename, options);
  }

  _readDoc(filename, options) {
    const content = this._readFile(filename);
    const zip = new PizZip(content);

    return new Docxtemplater(zip, {
      ...options,
      paragraphLoop: true,
      linebreaks: true,
    });
  }

  _readFile(filename) {
    return readFileSync(filename, "binary");
  }

  render(data) {
    this.doc.render(data);

    return this;
  }

  generate() {
    return this.doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
  }
}

module.exports = Template;
